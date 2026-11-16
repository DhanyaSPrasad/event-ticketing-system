import { NextResponse } from "next/server";
import { adminPool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/http";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const venueId = Number(body.venueId);
    const name = String(body.name ?? "").trim();
    const location = String(body.location ?? "").trim();
    if (!Number.isInteger(venueId) || venueId < 1 || !name || !location) {
      return NextResponse.json({ error: "Provide a valid venue ID, name and location." }, { status: 400 });
    }
    const [result] = await adminPool.execute<ResultSetHeader>(
      "UPDATE Venues SET name = ?, location = ? WHERE venue_id = ?",
      [name, location, venueId]
    );
    if (result.affectedRows === 0) {
      const [rows] = await adminPool.query<RowDataPacket[]>(
        "SELECT venue_id FROM Venues WHERE venue_id = ?", [venueId]
      );
      if (!rows.length) return NextResponse.json({ error: "Venue not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Venue updated." });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const venueId = Number(new URL(request.url).searchParams.get("venueId"));
    if (!Number.isInteger(venueId) || venueId < 1) {
      return NextResponse.json({ error: "Invalid venue ID." }, { status: 400 });
    }
    const [eventRows] = await adminPool.query<RowDataPacket[]>(
      "SELECT event_id FROM Events WHERE venue_id = ? LIMIT 1", [venueId]
    );
    if (eventRows.length) {
      return NextResponse.json({ error: "This venue has events. Delete or reassign those events before deleting the venue." }, { status: 409 });
    }
    const [seatRows] = await adminPool.query<RowDataPacket[]>(
      "SELECT seat_id FROM Seats WHERE venue_id = ? LIMIT 1", [venueId]
    );
    if (seatRows.length) {
      return NextResponse.json({ error: "This venue still has physical seats. Remove its seats before deleting the venue." }, { status: 409 });
    }
    const [result] = await adminPool.execute<ResultSetHeader>(
      "DELETE FROM Venues WHERE venue_id = ?", [venueId]
    );
    if (result.affectedRows === 0) return NextResponse.json({ error: "Venue not found." }, { status: 404 });
    return NextResponse.json({ message: "Venue deleted." });
  } catch (error) {
    return apiError(error);
  }
}
