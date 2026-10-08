import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { assertSameOrigin, jsonError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const response = NextResponse.json({ ok: true });
    clearAuthCookie(response);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
