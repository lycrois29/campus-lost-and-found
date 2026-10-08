import { NextResponse } from "next/server";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { objectIdSchema } from "@/lib/validation";
import { z } from "zod";
import Item from "@/models/Item";
import Claim from "@/models/Claim";
import Category from "@/models/Category";
import User from "@/models/User";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const session = await requireUser(["Admin"]);
    const id = objectIdSchema.parse((await context.params).id);
    const body = z.object({ role: z.enum(["Student", "Admin"]).optional(), isApproved: z.boolean().optional() }).refine((value) => value.role !== undefined || value.isApproved !== undefined).parse(await request.json());
    if (id === session.id && (body.role === "Student" || body.isApproved === false)) return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
    await connectDB();
    const target = await User.findById(id);
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (body.role === "Admin" && target.isApproved === false && body.isApproved !== true) return NextResponse.json({ error: "Verify and approve this account before granting Admin access." }, { status: 400 });
    if (body.role) target.role = body.role;
    if (body.isApproved !== undefined) target.isApproved = body.isApproved;
    await target.save();
    const user = await User.findById(id).select("name email role isApproved createdAt").lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return jsonOk({ user: { ...user, id: String(user._id), isApproved: user.isApproved !== false } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const session = await requireUser(["Admin"]);
    const id = objectIdSchema.parse((await context.params).id);
    if (id === session.id) return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    await connectDB();
    const [reports, claims, categories] = await Promise.all([Item.countDocuments({ reportedBy: id }), Claim.countDocuments({ claimant: id }), Category.countDocuments({ createdBy: id })]);
    if (reports || claims || categories) return NextResponse.json({ error: "This user has reports, claims, or categories. Resolve their data before deleting the account." }, { status: 409 });
    const user = await User.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
