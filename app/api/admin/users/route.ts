import { jsonError, jsonOk } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await requireUser(["Admin"]);
    await connectDB();
    const users = await User.find().select("name email role isApproved createdAt").sort({ createdAt: -1 }).lean();
    return jsonOk({ users: users.map((user) => ({ ...user, id: String(user._id), isApproved: user.isApproved !== false })) });
  } catch (error) {
    return jsonError(error);
  }
}
