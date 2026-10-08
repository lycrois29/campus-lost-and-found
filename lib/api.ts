import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth";

export function jsonError(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store", ...(error.status === 429 ? { "Retry-After": "900" } : {}) } });
  if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid input" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  if (error && typeof error === "object" && "code" in error && error.code === 11000) return NextResponse.json({ error: "That record already exists." }, { status: 409, headers: { "Cache-Control": "no-store" } });
  if (error && typeof error === "object" && "name" in error && error.name === "CastError") return NextResponse.json({ error: "Invalid ID." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  console.error(error);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500, headers: { "Cache-Control": "no-store" } });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) throw new AuthError("Invalid request origin.", 403);
}
