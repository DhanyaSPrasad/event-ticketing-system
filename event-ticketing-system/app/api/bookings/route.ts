import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";
import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";

type SeatRow = RowDataPacket & { seat_id: number; status: string; price: number };
type EventRow = RowDataPacket & { event_id: number; status: string; end_time: Date };

export async function POST(request: Request) {
  let connection: PoolConnection | undefined;
  try {
    const user = await requireUser();
    const body = await request.json();
    const eventId = Number(body.eventId);
    const seatIds = Array.isArray(body.seatIds) ? [...new Set(body.seatIds.map(Number))] : [];
    const paymentResult = body.paymentResult === "failure" ? "failure" : "success";
    if (!Number.isInteger(eventId) || eventId < 1 || seatIds.length < 1 ||
        seatIds.some((id: number) => !Number.isInteger(id) || id < 1)) {
      return NextResponse.json({ error: "Select one or more valid seats." }, { status: 400 });
    }
    if (seatIds.length > 8) return NextResponse.json({ error: "You can book at most 8 seats at once." }, { status: 400 });

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [eventRows] = await connection.query<EventRow[]>(
      "SELECT event_id, status, end_time FROM Events WHERE event_id = ? FOR UPDATE", [eventId]
    );
    if (!eventRows.length || eventRows[0].status !== "Scheduled" || new Date(eventRows[0].end_time) <= new Date()) {
      throw new Error("This event is not available for booking.");
    }

    const placeholders = seatIds.map(() => "?").join(",");
    const [seatRows] = await connection.query<SeatRow[]>(
      `SELECT es.seat_id, es.status, tt.price
       FROM Event_Seats es
       JOIN Ticket_Types tt ON tt.event_id = es.event_id AND tt.ticket_type_id = es.ticket_type_id
       WHERE es.event_id = ? AND es.seat_id IN (${placeholders})
       ORDER BY es.seat_id FOR UPDATE`,
      [eventId, ...seatIds]
    );
    if (seatRows.length !== seatIds.length) throw new Error("One or more selected seats do not belong to this event.");
    if (seatRows.some(s => s.status !== "AVAILABLE")) throw new Error("One or more seats have already been booked. Refresh and choose again.");

    const total = seatRows.reduce((sum, s) => sum + Number(s.price), 0);
    const [bookingResult] = await connection.query<ResultSetHeader>(
      "INSERT INTO Bookings (user_id, event_id, status, total_amount) VALUES (?, ?, 'PENDING', ?)",
      [user.userId, eventId, total]
    );
    const bookingId = bookingResult.insertId;

    for (const seat of seatRows) {
      await connection.query(
        "INSERT INTO Booking_Seats (booking_id, event_id, seat_id, ticket_price, status) VALUES (?, ?, ?, ?, 'ACTIVE')",
        [bookingId, eventId, seat.seat_id, seat.price]
      );
      await connection.query(
        "UPDATE Event_Seats SET status = 'BOOKED' WHERE event_id = ? AND seat_id = ? AND status = 'AVAILABLE'",
        [eventId, seat.seat_id]
      );
    }

    const payStatus = paymentResult === "success" ? "SUCCESS" : "FAILED";
    await connection.query(
      "INSERT INTO Payments (booking_id, amount, status, demo_reference) VALUES (?, ?, ?, ?)",
      [bookingId, total, payStatus, `DEMO-${bookingId}-${Date.now()}`]
    );

    if (paymentResult === "success") {
      await connection.query("UPDATE Bookings SET status = 'CONFIRMED' WHERE booking_id = ?", [bookingId]);
      await connection.commit();
      return NextResponse.json({ bookingId, message: `Booking #${bookingId} confirmed. Simulated payment succeeded.` });
    }

    // Failure is committed as a recorded failed attempt, but seats are released.
    await connection.query("UPDATE Bookings SET status = 'FAILED' WHERE booking_id = ?", [bookingId]);
    await connection.query("UPDATE Booking_Seats SET status = 'CANCELLED' WHERE booking_id = ?", [bookingId]);
    await connection.query(
      `UPDATE Event_Seats SET status = 'AVAILABLE'
       WHERE event_id = ? AND seat_id IN (${placeholders})`,
      [eventId, ...seatIds]
    );
    await connection.commit();
    return NextResponse.json({ bookingId, message: `Simulated payment failed for booking #${bookingId}; seats have been released.` });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => undefined);
    return apiError(error);
  } finally {
    connection?.release();
  }
}
