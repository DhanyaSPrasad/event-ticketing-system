"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EventItem = {
  event_id: number; title: string; description: string | null;
  start_time: string; end_time: string; status: "Scheduled" | "Cancelled" | "Completed";
  regular_price: number; premium_price: number;
};
type VenueItem = { venue_id: number; name: string; location: string; capacity: number };

function localDateTime(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export default function AdminManagement({ events, venues }: { events: EventItem[]; venues: VenueItem[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(url: string, method: "PATCH" | "DELETE", body?: object) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Operation failed.");
      setMessage(data.message || "Changes saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="panel stack">
    <h2>Manage events</h2>
    <p className="muted">Update event details and ticket prices. Events with booking history cannot be permanently deleted; cancel them instead.</p>
    {events.length === 0 ? <p>No events found.</p> : events.map(event => (
      <form className="panel stack" key={event.event_id} onSubmit={e => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        void send("/api/admin/events", "PATCH", {
          eventId: event.event_id, title: form.get("title"), description: form.get("description"),
          startTime: form.get("startTime"), endTime: form.get("endTime"), status: form.get("status"),
          regularPrice: Number(form.get("regularPrice")), premiumPrice: Number(form.get("premiumPrice"))
        });
      }}>
        <strong>Event #{event.event_id}</strong>
        <label>Title<input name="title" defaultValue={event.title} required maxLength={200} /></label>
        <label>Description<textarea name="description" defaultValue={event.description ?? ""} rows={2} maxLength={1000} /></label>
        <div className="grid">
          <label>Start<input name="startTime" type="datetime-local" defaultValue={localDateTime(event.start_time)} required /></label>
          <label>End<input name="endTime" type="datetime-local" defaultValue={localDateTime(event.end_time)} required /></label>
        </div>
        <div className="grid">
          <label>Status<select name="status" defaultValue={event.status}>
            <option value="Scheduled">Scheduled</option><option value="Cancelled">Cancelled</option><option value="Completed">Completed</option>
          </select></label>
          <label>Regular price (₹)<input name="regularPrice" type="number" min="0" step="0.01" defaultValue={Number(event.regular_price)} required /></label>
          <label>Premium price (₹)<input name="premiumPrice" type="number" min="0" step="0.01" defaultValue={Number(event.premium_price)} required /></label>
        </div>
        <div className="grid">
          <button disabled={busy} type="submit">Save event changes</button>
          <button disabled={busy} type="button" onClick={() => {
            if (window.confirm("Permanently delete this event? This is allowed only when it has no bookings.")) {
              void send(`/api/admin/events?eventId=${event.event_id}`, "DELETE");
            }
          }}>Delete event</button>
        </div>
      </form>
    ))}
    <h2>Manage venues</h2>
    <p className="muted">Venue capacity is shown but not editable here because physical seat records must match the capacity.</p>
    {venues.map(venue => (
      <form className="panel stack" key={venue.venue_id} onSubmit={e => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        void send("/api/admin/venues", "PATCH", {
          venueId: venue.venue_id, name: form.get("name"), location: form.get("location")
        });
      }}>
        <strong>Venue #{venue.venue_id} · Capacity: {venue.capacity}</strong>
        <label>Name<input name="name" defaultValue={venue.name} required maxLength={150} /></label>
        <label>Location<input name="location" defaultValue={venue.location} required maxLength={255} /></label>
        <div className="grid">
          <button disabled={busy} type="submit">Save venue changes</button>
          <button disabled={busy} type="button" onClick={() => {
            if (window.confirm("Permanently delete this venue? It must have no events or physical seats.")) {
              void send(`/api/admin/venues?venueId=${venue.venue_id}`, "DELETE");
            }
          }}>Delete venue</button>
        </div>
      </form>
    ))}
    {message && <div className={message.includes("updated") || message.includes("deleted") ? "notice" : "error"}>{message}</div>}
  </section>;
}
