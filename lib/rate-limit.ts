import { createHash } from "node:crypto";
import { connectDB } from "@/lib/db";
import { AuthError } from "@/lib/auth";
import RateLimit from "@/models/RateLimit";

const WINDOW_MS = 15 * 60 * 1000;

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function consume(key: string, limit: number) {
  await connectDB();
  const now = Date.now();
  const window = Math.floor(now / WINDOW_MS);
  const digest = createHash("sha256").update(`${process.env.JWT_SECRET ?? "local"}:${key}:${window}`).digest("hex");
  const expiresAt = new Date((window + 1) * WINDOW_MS + 60_000);
  let entry;
  try {
    entry = await RateLimit.findOneAndUpdate(
      { key: digest },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, new: true },
    );
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === 11000)) throw error;
    entry = await RateLimit.findOneAndUpdate({ key: digest }, { $inc: { count: 1 } }, { new: true });
  }
  if (entry && entry.count > limit) throw new AuthError("Too many attempts. Please try again in 15 minutes.", 429);
}

export async function limitAuthAttempt(request: Request, action: "login" | "register", email: string) {
  const ip = clientIp(request);
  await consume(`${action}:ip:${ip}`, action === "login" ? 20 : 8);
  await consume(`${action}:account:${ip}:${email}`, action === "login" ? 6 : 3);
}
