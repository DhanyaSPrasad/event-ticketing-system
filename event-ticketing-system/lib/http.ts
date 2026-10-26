import { NextResponse } from "next/server";

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  const status = message === "UNAUTHENTICATED" ? 401 :
    message === "FORBIDDEN" ? 403 :
    message === "MYSQL_CONNECTION_ERROR" ? 503 : 400;
  return NextResponse.json({ error: message }, { status });
}
