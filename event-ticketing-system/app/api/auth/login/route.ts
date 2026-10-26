import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

    const [rows] = await pool.query(
      "SELECT user_id, name, email, password_hash, role FROM Users WHERE email = ? LIMIT 1",
      [email]
    );
    const users = rows as { user_id: number; name: string; email: string; password_hash: string; role: "Admin" | "Customer" }[];
    if (!users.length || !(await bcrypt.compare(password, users[0].password_hash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const u = users[0];
    await createSession({ userId: u.user_id, name: u.name, email: u.email, role: u.role });
    return NextResponse.json({ user: { name: u.name, email: u.email, role: u.role } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign-in failed";
    return NextResponse.json({ error: message.includes("AUTH_SECRET") ? message : "Unable to sign in. Check database setup." }, { status: 500 });
  }
}
