"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("Demo123!");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign-in failed");
      router.push(data.user.role === "Admin" ? "/admin" : "/");
      router.refresh();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Sign-in failed"); }
    finally { setBusy(false); }
  }

  return <div className="panel" style={{ maxWidth: 480, margin: "auto" }}>
    <h1>Sign in</h1>
    <p className="muted">Demo accounts use the password <code>Demo123!</code>.</p>
    <form onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      {message && <div className="error">{message}</div>}
      <button disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
    </form>
    <hr />
    <p><button className="secondary" onClick={() => { setEmail("admin@example.com"); setPassword("Demo123!"); }}>Use demo admin</button></p>
    <p><button className="secondary" onClick={() => { setEmail("customer@example.com"); setPassword("Demo123!"); }}>Use demo customer</button></p>
  </div>;
}
