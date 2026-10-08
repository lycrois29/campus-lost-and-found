import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User, { type UserRole } from "@/models/User";

const COOKIE_NAME = "campus_auth";
function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Please define ${name} in your environment variables.`);
  if (name === "JWT_SECRET" && value.length < 32) throw new Error("JWT_SECRET must be at least 32 characters.");
  return value;
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type TokenPayload = { id: string; v: number; iat: number; exp: number };

export function createToken(user: SessionUser & { sessionVersion?: number }) {
  return jwt.sign({ id: user.id, v: user.sessionVersion ?? 0 }, requiredEnv("JWT_SECRET"), { expiresIn: "24h", issuer: "campusfind", audience: "campusfind-web", algorithm: "HS256" });
}

export function setAuthCookie(response: NextResponse, user: SessionUser & { sessionVersion?: number }) {
  response.cookies.set(COOKIE_NAME, createToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: new Date(0), path: "/" });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, requiredEnv("JWT_SECRET"), { algorithms: ["HS256"], issuer: "campusfind", audience: "campusfind-web" }) as unknown as TokenPayload;
    if (!mongoose.isValidObjectId(payload.id)) return null;
    await connectDB();
    const user = await User.findById(payload.id).select("name email role isApproved sessionVersion").lean();
    if (!user || user.isApproved === false || payload.v !== (user.sessionVersion ?? 0)) return null;
    return publicUser(user);
  } catch {
    return null;
  }
}

export async function requireUser(roles?: UserRole[]) {
  const session = await getSessionUser();
  if (!session) throw new AuthError("Authentication required", 401);
  if (roles && !roles.includes(session.role)) throw new AuthError("You do not have permission for this action", 403);
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function findUserById(id: string) {
  await connectDB();
  return User.findById(id).select("-passwordHash").lean();
}

export function publicUser(user: { _id: unknown; name: string; email: string; role: UserRole }) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}
