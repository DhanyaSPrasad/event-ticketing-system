"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="error stack"><h1>Something went wrong</h1><p>Check the server console and database configuration.</p><button onClick={() => reset()}>Try again</button></div>;
}
