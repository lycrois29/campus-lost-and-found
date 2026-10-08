import { NextResponse } from "next/server";
import { assertSameOrigin, jsonError } from "@/lib/api";
import { hashPassword, publicUser, requireUser, setAuthCookie, verifyPassword } from "@/lib/auth";
import { passwordChangeSchema } from "@/lib/validation";
import { limitAuthAttempt } from "@/lib/rate-limit";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireUser();
    const input = passwordChangeSchema.parse(await request.json());
    await limitAuthAttempt(request, "login", session.email);
    const user = await User.findById(session.id);
    if (!user || !(await verifyPassword(input.currentPassword, user.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    user.passwordHash = await hashPassword(input.newPassword);
    user.sessionVersion = (user.sessionVersion ?? 0) + 1;
    await user.save();
    const response = NextResponse.json({ ok: true });
    setAuthCookie(response, { ...publicUser(user), sessionVersion: user.sessionVersion });
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
