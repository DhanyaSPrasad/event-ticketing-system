import Link from "next/link";
import EventSearch from "@/components/EventSearch";
import { customerPool } from "@/lib/db";

export const dynamic = "force-dynamic";

type EventRow = {
  event_id: number; title: string; description: string | null;
  start_time: Date; end_time: Date; venue_name: string; location: string;
  available_seats: number; min_price: number | null;
};

export default async function HomePage() {
  let events: EventRow[] = [];
  let error = "";
  try {
    const [rows] = await customerPool.query(`
      SELECT e.event_id, e.title, e.description, e.start_time, e.end_time,
             v.name AS venue_name, v.location,
             SUM(es.status = 'AVAILABLE') AS available_seats,
             MIN(tt.price) AS min_price
      FROM Events e
      JOIN Venues v ON v.venue_id = e.venue_id
      LEFT JOIN Event_Seats es ON es.event_id = e.event_id
      LEFT JOIN Ticket_Types tt ON tt.event_id = es.event_id AND tt.ticket_type_id = es.ticket_type_id
      WHERE e.status = 'Scheduled' AND e.end_time > NOW()
      GROUP BY e.event_id, e.title, e.description, e.start_time, e.end_time, v.name, v.location
      ORDER BY e.start_time
    `);
    events = rows as EventRow[];
  } catch {
    error = "Could not connect to MySQL. Check .env.local and run database/schema.sql and database/seed.sql.";
  }

  return (
    <div className="stack">
      <div>
        <h1>Upcoming events</h1>
        <p className="muted">Browse events, choose seats and book tickets. Payments are simulated for this academic demo.</p>
      </div>
      {error && <div className="error">{error}</div>}
      {!error && events.length === 0 && <div className="panel">No upcoming events found. Run the seed SQL to load demo events.</div>}
      {!error && <EventSearch events={events} />}
    </div>
  );
}
