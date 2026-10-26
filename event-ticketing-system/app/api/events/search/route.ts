import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongo";

export async function GET(request: Request) {
  try {
    const db = await getMongoDb();
    if (!db) return NextResponse.json({ message: "MongoDB is not configured", results: [] });
    const q = new URL(request.url).searchParams.get("q")?.trim();
    if (!q) return NextResponse.json({ results: [] });
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const results = await db.collection("event_metadata").find({
      $or: [
        { tags: { $regex: escaped, $options: "i" } },
        { search_keywords: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } }
      ]
    }, { projection: { _id: 0 } }).limit(20).toArray();
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "MongoDB search failed. Check MONGODB_URI." }, { status: 503 });
  }
}
