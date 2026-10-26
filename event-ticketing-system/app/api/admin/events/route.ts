import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/http";
import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";

type VenueRow = RowDataPacket & { venue_id: number; capacity: number };

export async function POST(request: Request) {
  let connection: PoolConnection | undefined;
  try {
    await requireAdmin();
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const venueId = Number(body.venueId);
    const start = new Date(String(body.startTime ?? ""));
    const end = new Date(String(body.endTime ?? ""));
    const regularPrice = Number(body.regularPrice);
    const premiumPrice = Number(body.premiumPrice);

    if (!title || !Number.isInteger(venueId) || venueId < 1 ||
        Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start ||
        !Number.isFinite(regularPrice) || regularPrice < 0 ||
        !Number.isFinite(premiumPrice) || premiumPrice < 0) {
      return NextResponse.json({ error: "Enter a title, valid dates, venue, and non-negative prices." }, { status: 400 });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [venueRows] = await connection.query<VenueRow[]>(
      "SELECT venue_id, capacity FROM Venues WHERE venue_id = ? FOR UPDATE", [venueId]
    );
    if (!venueRows.length) throw new Error("Venue not found.");

    const [conflicts] = await connection.query<RowDataPacket[]>(
      `SELECT event_id FROM Events
       WHERE venue_id = ? AND status = 'Scheduled'
         AND start_time < ? AND end_time > ?
       FOR UPDATE`,
      [venueId, end, start]
    );
    if (conflicts.length) throw new Error("This venue already has an event during that time.");

    const [eventInsert] = await connection.query<ResultSetHeader>(
      "INSERT INTO Events (venue_id, title, description, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, 'Scheduled')",
      [venueId, title, description || null, start, end]
    );
    const eventId = eventInsert.insertId;

    const [regularInsert] = await connection.query<ResultSetHeader>(
      "INSERT INTO Ticket_Types (event_id, type_name, price) VALUES (?, 'Regular', ?)",
      [eventId, regularPrice]
    );
    const [premiumInsert] = await connection.query<ResultSetHeader>(
      "INSERT INTO Ticket_Types (event_id, type_name, price) VALUES (?, 'Premium', ?)",
      [eventId, premiumPrice]
    );

    await connection.query(
      `INSERT INTO Event_Seats (event_id, venue_id, seat_id, ticket_type_id, status)
       SELECT ?, s.venue_id, s.seat_id,
              CASE WHEN s.row_label IN ('A','B') THEN ? ELSE ? END,
              'AVAILABLE'
       FROM Seats s WHERE s.venue_id = ?`,
      [eventId, premiumInsert.insertId, regularInsert.insertId, venueId]
    );

    await connection.commit();
    return NextResponse.json({ eventId });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => undefined);
    return apiError(error);
  } finally {
    connection?.release();
  }
}
