import { notFound } from "next/navigation";
import { customerPool } from "@/lib/db";
import BookingForm from "@/components/BookingForm";

export const dynamic = "force-dynamic";

type EventInfo = {
  event_id: number; title: string; description: string | null; start_time: Date;
  end_time: Date; venue_name: string; location: string;
};
type SeatInfo = {
  seat_id: number; row_label: string; seat_number: number;
  status: "AVAILABLE" | "BOOKED"; type_name: string; price: number;
};

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId < 1) notFound();

  const [eventRows] = await customerPool.query(`
    SELECT e.event_id, e.title, e.description, e.start_time, e.end_time,
           v.name AS venue_name, v.location
    FROM Events e JOIN Venues v ON e.venue_id = v.venue_id
    WHERE e.event_id = ? AND e.status = 'Scheduled'
  `, [eventId]);
  const events = eventRows as EventInfo[];
  if (!events.length) notFound();

  const [seatRows] = await customerPool.query(`
    SELECT s.seat_id, s.row_label, s.seat_number, es.status,
           tt.type_name, tt.price
    FROM Event_Seats es
    JOIN Seats s ON s.seat_id = es.seat_id
    JOIN Ticket_Types tt
      ON tt.event_id = es.event_id AND tt.ticket_type_id = es.ticket_type_id
    WHERE es.event_id = ?
    ORDER BY s.row_label, s.seat_number
  `, [eventId]);
  const seats = (seatRows as SeatInfo[]).map(s => ({ ...s, price: Number(s.price) }));

  return <div className="stack">
    <a href="/">← All events</a>
    <section className="panel stack">
      <h1>{events[0].title}</h1>
      <p>{events[0].description}</p>
      <p><strong>Venue:</strong> {events[0].venue_name}, {events[0].location}</p>
      <p><strong>Start:</strong> {new Date(events[0].start_time).toLocaleString()}</p>
      <p><strong>End:</strong> {new Date(events[0].end_time).toLocaleString()}</p>
    </section>
    <BookingForm eventId={eventId} seats={seats} />
  </div>;
}
