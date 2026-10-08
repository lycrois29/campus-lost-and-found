import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { publicUser, setAuthCookie, verifyPassword } from "@/lib/auth";
import { assertSameOrigin, jsonError } from "@/lib/api";
import { limitAuthAttempt } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = loginSchema.parse(await request.json());
    await limitAuthAttempt(request, "login", input.email);
    await connectDB();
    const user = await User.findOne({ email: input.email });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (user.isApproved === false) return NextResponse.json({ error: "Your account is awaiting administrator verification or has been suspended." }, { status: 403 });
    const safeUser = publicUser(user);
    const response = NextResponse.json({ user: safeUser });
    setAuthCookie(response, { ...safeUser, sessionVersion: user.sessionVersion ?? 0 });
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
