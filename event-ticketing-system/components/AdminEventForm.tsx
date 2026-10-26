"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Venue = { venue_id: number; name: string; capacity: number };

export default function AdminEventForm({ venues }: { venues: Venue[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venueId, setVenueId] = useState(String(venues[0]?.venue_id ?? ""));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [regularPrice, setRegularPrice] = useState("500");
  const [premiumPrice, setPremiumPrice] = useState("1000");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, venueId: Number(venueId), startTime, endTime, regularPrice: Number(regularPrice), premiumPrice: Number(premiumPrice) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create event");
      setMessage(`Created event #${data.eventId}. Seat allocations were created for this venue.`);
      setTitle(""); setDescription(""); router.refresh();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not create event"); }
    finally { setBusy(false); }
  }

  return <section className="panel stack">
    <h2>Create event</h2>
    {venues.length === 0 ? <p>Create a venue and seats in MySQL before adding events.</p> :
      <form onSubmit={submit}>
        <label>Event title<input value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} /></label>
        <label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} rows={2} /></label>
        <label>Venue<select value={venueId} onChange={e => setVenueId(e.target.value)} required>{venues.map(v => <option key={v.venue_id} value={v.venue_id}>{v.name} ({v.capacity} capacity)</option>)}</select></label>
        <div className="grid">
          <label>Start date/time<input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required /></label>
          <label>End date/time<input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required /></label>
        </div>
        <div className="grid">
          <label>Regular price (₹)<input type="number" min="0" step="0.01" value={regularPrice} onChange={e => setRegularPrice(e.target.value)} required /></label>
          <label>Premium price (₹)<input type="number" min="0" step="0.01" value={premiumPrice} onChange={e => setPremiumPrice(e.target.value)} required /></label>
        </div>
        <button disabled={busy}>{busy ? "Creating..." : "Create event"}</button>
      </form>}
    {message && <div className={message.startsWith("Created") ? "notice" : "error"}>{message}</div>}
  </section>;
}
