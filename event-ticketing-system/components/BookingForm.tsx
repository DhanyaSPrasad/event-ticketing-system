"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Seat = {
  seat_id: number; row_label: string; seat_number: number;
  status: "AVAILABLE" | "BOOKED"; type_name: string; price: number;
};

export default function BookingForm({ eventId, seats }: { eventId: number; seats: Seat[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const [paymentResult, setPaymentResult] = useState<"success" | "failure">("success");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const byId = useMemo(() => new Map(seats.map(s => [s.seat_id, s])), [seats]);
  const total = selected.reduce((sum, id) => sum + (byId.get(id)?.price ?? 0), 0);

  function toggle(id: number) {
    setSelected(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  }

  async function submit() {
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, seatIds: selected, paymentResult })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setMessage(data.message);
      setSelected([]);
      router.refresh();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Booking failed"); }
    finally { setBusy(false); }
  }

  return <section className="panel stack">
    <h2>Select seats</h2>
    <p className="muted">Green = available. Grey = booked. Seat prices depend on the event's ticket category.</p>
    {seats.length === 0 ? <p>No seat allocations are configured for this event.</p> :
      <div className="seats">
        {seats.map(seat => {
          const label = `${seat.row_label}${seat.seat_number}`;
          return <button
            type="button" key={seat.seat_id}
            className={`seat ${selected.includes(seat.seat_id) ? "selected" : ""}`}
            disabled={seat.status !== "AVAILABLE"}
            title={`${label} · ${seat.type_name} · ₹${seat.price}`}
            onClick={() => toggle(seat.seat_id)}
          >{label}<br /><small>₹{seat.price}</small></button>;
        })}
      </div>}
    <p><strong>Selected:</strong> {selected.length ? selected.map(id => {
      const s = byId.get(id)!; return `${s.row_label}${s.seat_number}`;
    }).join(", ") : "None"}</p>
    <h3>Total: ₹{total.toFixed(2)}</h3>
    <label>Simulated payment result
      <select value={paymentResult} onChange={e => setPaymentResult(e.target.value as "success" | "failure")}>
        <option value="success">Success</option>
        <option value="failure">Failure</option>
      </select>
    </label>
    <button onClick={submit} disabled={busy || selected.length === 0}>
      {busy ? "Processing..." : `Book ${selected.length || ""} seat(s)`}
    </button>
    {message && <div className={message.toLowerCase().includes("failed") ? "error" : "notice"}>{message}</div>}
  </section>;
}
