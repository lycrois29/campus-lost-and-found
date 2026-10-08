import { jsonError, jsonOk } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Claim from "@/models/Claim";
import Item from "@/models/Item";
import User from "@/models/User";

export async function GET() {
  try {
    await requireUser(["Admin"]);
    await connectDB();
    const [items, pendingItems, approvedItems, claims, pendingClaims, students] = await Promise.all([
      Item.countDocuments(), Item.countDocuments({ status: "Pending" }), Item.countDocuments({ status: "Approved" }),
      Claim.countDocuments(), Claim.countDocuments({ status: "Pending" }), User.countDocuments({ role: "Student" }),
    ]);
    return jsonOk({ stats: { items, pendingItems, approvedItems, claims, pendingClaims, students } });
  } catch (error) {
    return jsonError(error);
  }
}
