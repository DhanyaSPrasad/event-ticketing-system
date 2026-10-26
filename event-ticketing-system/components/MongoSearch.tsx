"use client";

import { FormEvent, useState } from "react";

type Result = { event_id: number; description?: string; tags?: string[] };

export default function MongoSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault(); setMessage("");
    const res = await fetch(`/api/events/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results || []);
    setMessage(data.message || data.error || "");
  }

  return <section className="panel stack">
    <h2>Discover by tags (MongoDB)</h2>
    <form onSubmit={submit}>
      <label>Search event metadata<input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. music, family, technology" /></label>
      <button>Search metadata</button>
    </form>
    {message && <p className="muted">{message}</p>}
    {results.map(r => <div key={r.event_id}><a href={`/events/${r.event_id}`}>Event #{r.event_id}</a> — {r.description} <small>{r.tags?.join(", ")}</small></div>)}
  </section>;
}
