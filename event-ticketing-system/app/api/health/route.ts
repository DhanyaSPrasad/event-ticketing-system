import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    await pool.query("SELECT 1");
    return NextResponse.json({ status: "ok", mysql: "connected" });
  } catch {
    return NextResponse.json({ status: "error", mysql: "disconnected" }, { status: 503 });
  }
}
