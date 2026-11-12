
import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongo";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/http";

function validStringArray(value: unknown): value is string[] {
  return Array.isArray(value) &&
    value.every(item => typeof item === "string" && item.trim().length > 0);
}

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { error: "MongoDB is not configured" },
        { status: 503 }
      );
    }

    const eventId = new URL(request.url).searchParams.get("eventId");
    const filter = eventId ? { event_id: Number(eventId) } : {};

    if (eventId && (!Number.isInteger(Number(eventId)) || Number(eventId) < 1)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const results = await db.collection("event_metadata")
      .find(filter, { projection: { _id: 0 } })
      .toArray();

    return NextResponse.json({ results });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { error: "MongoDB is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const eventId = Number(body.event_id);

    if (!Number.isInteger(eventId) || eventId < 1 ||
        typeof body.description !== "string" ||
        !validStringArray(body.tags) ||
        !validStringArray(body.amenities) ||
        !validStringArray(body.search_keywords)) {
      return NextResponse.json(
        { error: "Provide a valid event_id, description, tags, amenities and search_keywords." },
        { status: 400 }
      );
    }

    const document = {
      event_id: eventId,
      description: body.description.trim(),
      tags: body.tags,
      amenities: body.amenities,
      search_keywords: body.search_keywords
    };

    await db.collection("event_metadata").insertOne(document);

    return NextResponse.json(
      { message: "Event metadata created", event_id: eventId },
      { status: 201 }
    );
  } catch (error) {
    if (error && typeof error === "object" && "code" in error &&
        error.code === 11000) {
      return NextResponse.json(
        { error: "Metadata already exists for this event." },
        { status: 409 }
      );
    }
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { error: "MongoDB is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const eventId = Number(body.event_id);
    const updates: Record<string, unknown> = {};

    if (!Number.isInteger(eventId) || eventId < 1) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string") {
        return NextResponse.json({ error: "Invalid description" }, { status: 400 });
      }
      updates.description = body.description.trim();
    }

    for (const field of ["tags", "amenities", "search_keywords"]) {
      if (body[field] !== undefined) {
        if (!validStringArray(body[field])) {
          return NextResponse.json(
            { error: `Invalid ${field}` },
            { status: 400 }
          );
        }
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Provide at least one metadata field to update." },
        { status: 400 }
      );
    }

    const result = await db.collection("event_metadata").updateOne(
      { event_id: eventId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Metadata not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event metadata updated" });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { error: "MongoDB is not configured" },
        { status: 503 }
      );
    }

    const eventId = Number(
      new URL(request.url).searchParams.get("eventId")
    );

    if (!Number.isInteger(eventId) || eventId < 1) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const result = await db.collection("event_metadata").deleteOne({
      event_id: eventId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Metadata not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event metadata deleted" });
  } catch (error) {
    return apiError(error);
  }
}
