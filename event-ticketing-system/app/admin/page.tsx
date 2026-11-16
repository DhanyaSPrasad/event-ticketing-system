import { adminPool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import AdminEventForm from "@/components/AdminEventForm";
import AdminManagement from "@/components/AdminManagement";

export const dynamic = "force-dynamic";

type Venue = { venue_id: number; name: string; capacity: number };
type VenueManagement = Venue & { location: string };
type EventManagement = {
  event_id: number; title: string; description: string | null;
  start_time: Date; end_time: Date; status: "Scheduled" | "Cancelled" | "Completed";
  regular_price: number; premium_price: number;
};
type Report = { event_id: number; title: string; confirmed_bookings: number; total_sales: number; booked_seats: number; total_seats: number };
type AuditRow = { audit_id: number; booking_id: number; old_status: string; new_status: string; changed_at: Date };

export default async function AdminPage() {
  const user = await getSession();
  if (!user) return <div className="panel stack"><h1>Admin</h1><p>Please sign in as an admin.</p><a className="button" href="/login">Sign in</a></div>;
  if (user.role !== "Admin") return <div className="error">Access denied. This page is for administrators.</div>;

  const [venueRows] = await adminPool.query("SELECT venue_id, name, location, capacity FROM Venues ORDER BY name");
  const [eventRows] = await adminPool.query(`
    SELECT e.event_id, e.title, e.description, e.start_time, e.end_time, e.status,
      COALESCE(MAX(CASE WHEN tt.type_name = 'Regular' THEN tt.price END), 0) AS regular_price,
      COALESCE(MAX(CASE WHEN tt.type_name = 'Premium' THEN tt.price END), 0) AS premium_price
    FROM Events e
    LEFT JOIN Ticket_Types tt ON tt.event_id = e.event_id
    GROUP BY e.event_id, e.title, e.description, e.start_time, e.end_time, e.status
    ORDER BY e.event_id DESC
  `);
  const [reportRows] = await adminPool.query(`
    SELECT e.event_id, e.title,
      COUNT(DISTINCT CASE WHEN b.status = 'CONFIRMED' THEN b.booking_id END) AS confirmed_bookings,
      COALESCE(SUM(CASE WHEN b.status = 'CONFIRMED' THEN b.total_amount ELSE 0 END), 0) AS total_sales,
      SUM(es.status = 'BOOKED') AS booked_seats,
      COUNT(es.seat_id) AS total_seats
    FROM Events e
    LEFT JOIN Bookings b ON b.event_id = e.event_id
    LEFT JOIN Event_Seats es ON es.event_id = e.event_id
    GROUP BY e.event_id, e.title
    ORDER BY e.event_id DESC
  `);
  const [auditRows] = await adminPool.query(`
    SELECT audit_id, booking_id, old_status, new_status, changed_at
    FROM Booking_Status_Audit
    ORDER BY changed_at DESC, audit_id DESC
    LIMIT 20
  `);

  const managedEvents = (eventRows as EventManagement[]).map(e => ({
    ...e, start_time: e.start_time.toISOString(), end_time: e.end_time.toISOString()
  }));

  return <div className="stack">
    <h1>Admin dashboard</h1>
    <div className="notice">Signed in as {user.name}. Use this page to manage events and venues and review summary reports.</div>
    <AdminEventForm venues={venueRows as Venue[]} />
    <AdminManagement events={managedEvents} venues={venueRows as VenueManagement[]} />
    <section className="panel stack">
      <h2>Event sales and occupancy</h2>
      <div style={{ overflowX: "auto" }}>
        <table><thead><tr><th>Event</th><th>Confirmed bookings</th><th>Sales</th><th>Booked seats</th><th>Total seats</th></tr></thead>
          <tbody>{(reportRows as Report[]).map(r => <tr key={r.event_id}>
            <td>{r.title}</td><td>{Number(r.confirmed_bookings)}</td><td>₹{Number(r.total_sales).toFixed(2)}</td>
            <td>{Number(r.booked_seats || 0)}</td><td>{Number(r.total_seats || 0)}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
    <section className="panel stack">
      <h2>Recent booking status changes</h2>
      <p className="muted">Automatically recorded by the MySQL trigger whenever a booking status changes.</p>
      {(auditRows as AuditRow[]).length === 0 ? <p>No booking status changes recorded yet.</p> :
        <div style={{ overflowX: "auto" }}>
          <table><thead><tr><th>Audit ID</th><th>Booking</th><th>Old status</th><th>New status</th><th>Changed at</th></tr></thead>
            <tbody>{(auditRows as AuditRow[]).map(a => <tr key={a.audit_id}>
              <td>{a.audit_id}</td><td>#{a.booking_id}</td><td>{a.old_status}</td><td>{a.new_status}</td>
              <td>{new Date(a.changed_at).toLocaleString("en-IN", {timeZone: "Asia/Kolkata"})}</td>
            </tr>)}</tbody>
          </table>
        </div>}
    </section>
  </div>;
}
