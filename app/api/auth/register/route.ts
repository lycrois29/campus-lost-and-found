import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/api";
import { limitAuthAttempt } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = registerSchema.parse(await request.json());
    const domain = (process.env.STUDENT_EMAIL_DOMAIN || "au.edu").replace(/^@/, "").toLowerCase();
    if (!input.email.endsWith(`@${domain}`)) return NextResponse.json({ error: `Use your @${domain} university email address.` }, { status: 400 });
    await limitAuthAttempt(request, "register", input.email);
    await connectDB();
    const existing = await User.findOne({ email: input.email });
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    await User.create({ name: input.name, email: input.email, passwordHash: await hashPassword(input.password), role: "Student", isApproved: false });
    return jsonOk({ message: "Account submitted. An administrator must verify your student identity before you can log in." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
