
"use client";

import { useState } from "react";
import Link from "next/link";

type EventItem = {
  event_id: number;
  title: string;
  description: string | null;
  start_time: Date | string;
  venue_name: string;
  location: string;
  available_seats: number;
  min_price: number | null;
};

export default function EventSearch({
  events
}: {
  events: EventItem[];
}) {
  const [query, setQuery] = useState("");

  const filteredEvents = events.filter((event) => {
    const searchText = [
      event.title,
      event.description ?? "",
      event.venue_name,
      event.location
    ].join(" ").toLowerCase();

    return searchText.includes(query.trim().toLowerCase());
  });

  return (
    <>
      <section className="panel stack">
        <h2>Search events</h2>

        <label>
          Search by event name, description or venue
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. music, DJ, technology, PESU"
          />
        </label>

        {query && (
          <button
            type="button"
            className="button"
            onClick={() => setQuery("")}
          >
            Clear search
          </button>
        )}

        <p className="muted">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </section>

      {filteredEvents.length === 0 ? (
        <section className="panel">
          {query.trim()
            ? "No matching events found. Try another search."
            : "No upcoming events found."}
        </section>
      ) : (
        <div className="grid">
          {filteredEvents.map((event) => (
            <article className="card stack" key={event.event_id}>
              <div className="row spread">
                <h2>{event.title}</h2>
                <small>#{event.event_id}</small>
              </div>

              <p>
                {event.description ||
                  "Event details will be announced."}
              </p>

              <div>
                <strong>Venue:</strong> {event.venue_name},{" "}
                {event.location}
              </div>

              <div>
                <strong>Starts:</strong>{" "}
                {new Date(event.start_time).toLocaleString()}
              </div>

              <div>
                <strong>From:</strong>{" "}
                {event.min_price == null
                  ? "N/A"
                  : `₹${Number(event.min_price).toFixed(2)}`}
              </div>

              <div>
                <strong>Available seats:</strong>{" "}
                {Number(event.available_seats || 0)}
              </div>

              <Link
                className="button"
                href={`/events/${event.event_id}`}
              >
                View event / book
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
