import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import AdminEventForm from "@/components/AdminEventForm";

export const dynamic = "force-dynamic";

type Venue = { venue_id: number; name: string; capacity: number };
type Report = { event_id: number; title: string; confirmed_bookings: number; total_sales: number; booked_seats: number; total_seats: number };

export default async function AdminPage() {
  const user = await getSession();
  if (!user) return <div className="panel stack"><h1>Admin</h1><p>Please sign in as an admin.</p><a className="button" href="/login">Sign in</a></div>;
  if (user.role !== "Admin") return <div className="error">Access denied. This page is for administrators.</div>;

  const [venueRows] = await pool.query("SELECT venue_id, name, capacity FROM Venues ORDER BY name");
  const [reportRows] = await pool.query(`
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
  return <div className="stack">
    <h1>Admin dashboard</h1>
    <div className="notice">Signed in as {user.name}. Use this page to create events and review summary reports.</div>
    <AdminEventForm venues={venueRows as Venue[]} />
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
  </div>;
}
