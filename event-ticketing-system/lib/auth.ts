import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type AppRole = "Admin" | "Customer";
export type SessionUser = { userId: number; name: string; email: string; role: AppRole };

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters in .env.local");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());

  const jar = await cookies();
  jar.set("ets_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get("ets_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.userId !== "number" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "Admin" && payload.role !== "Customer")
    ) return null;
    return {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSession();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "Admin") throw new Error("FORBIDDEN");
  return user;
}
