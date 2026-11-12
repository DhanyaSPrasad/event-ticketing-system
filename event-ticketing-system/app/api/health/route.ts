import { NextResponse } from "next/server";
import { adminPool, customerPool } from "@/lib/db";

export async function GET() {
  try {
    await Promise.all([adminPool.query("SELECT 1"), customerPool.query("SELECT 1")]);
    return NextResponse.json({ status: "ok", mysql: { admin: "connected", customer: "connected" } });
  } catch {
    return NextResponse.json({ status: "error", mysql: "one or more role connections failed" }, { status: 503 });
  }
}
