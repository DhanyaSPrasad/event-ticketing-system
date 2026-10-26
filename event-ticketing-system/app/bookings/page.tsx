import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type BookingRow = {
  booking_id: number; title: string; booking_time: Date; status: string;
  total_amount: number; payment_status: string | null; seats: string | null;
};

export default async function BookingsPage() {
  const user = await getSession();
  if (!user) return <div className="panel stack"><h1>My bookings</h1><p>Please sign in to view your bookings.</p><a className="button" href="/login">Sign in</a></div>;

  const [rows] = await pool.query(`
    SELECT b.booking_id, e.title, b.booking_time, b.status, b.total_amount,
           (SELECT p.status FROM Payments p WHERE p.booking_id = b.booking_id ORDER BY p.payment_id DESC LIMIT 1) AS payment_status,
           (SELECT GROUP_CONCAT(CONCAT(s.row_label, s.seat_number) ORDER BY s.row_label, s.seat_number SEPARATOR ', ')
            FROM Booking_Seats bs JOIN Seats s ON s.seat_id = bs.seat_id
            WHERE bs.booking_id = b.booking_id) AS seats
    FROM Bookings b JOIN Events e ON e.event_id = b.event_id
    WHERE b.user_id = ?
    ORDER BY b.booking_time DESC
  `, [user.userId]);
  const bookings = rows as BookingRow[];

  return <div className="stack">
    <h1>My bookings</h1>
    {bookings.length === 0 ? <div className="panel">No bookings yet. <a href="/">Browse events</a>.</div> :
      <div className="panel">
        <table><thead><tr><th>Booking</th><th>Event</th><th>Seats</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead>
          <tbody>{bookings.map(b => <tr key={b.booking_id}>
            <td>#{b.booking_id}<br /><small>{new Date(b.booking_time).toLocaleString()}</small></td>
            <td>{b.title}</td><td>{b.seats || "—"}</td><td>₹{Number(b.total_amount).toFixed(2)}</td><td>{b.status}</td><td>{b.payment_status || "—"}</td>
          </tr>)}</tbody>
        </table>
      </div>}
  </div>;
}
