import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/api";
import { serializeClaim } from "@/lib/serializers";
import { claimSchema, objectIdSchema } from "@/lib/validation";
import Claim from "@/models/Claim";
import Item from "@/models/Item";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const id = objectIdSchema.parse((await context.params).id);
    await connectDB();
    const claim = await Claim.findById(id);
    if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    if (user.role === "Admin") {
      const body = await request.json();
      const status = String(body.status ?? "");
      if (!["Pending", "Approved", "Rejected"].includes(status)) return NextResponse.json({ error: "Invalid claim status" }, { status: 400 });
      if (claim.status === "Approved" && status !== "Approved") return NextResponse.json({ error: "An approved claim cannot be reopened. Contact an administrator to resolve a mistake." }, { status: 409 });
      if (status === "Approved" && claim.status !== "Approved") {
        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            const current = await Claim.findById(id).session(session);
            if (!current || current.status === "Approved") throw new Error("Claim was already reviewed. Reload and try again.");
            const item = await Item.findOneAndUpdate(
              { _id: current.item, type: "Found", status: "Approved" },
              { $set: { status: "Returned", reviewedBy: user.id, reviewedAt: new Date() } },
              { new: true, session },
            );
            if (!item) throw new Error("Item is no longer available for a claim. Reload and try again.");
            current.status = "Approved";
            current.reviewedBy = new mongoose.Types.ObjectId(user.id);
            current.reviewedAt = new Date();
            await current.save({ session });
            await Claim.updateMany({ item: current.item, _id: { $ne: current._id }, status: "Pending" },
              { $set: { status: "Rejected", reviewedBy: user.id, reviewedAt: new Date() } }, { session });
          });
        } finally {
          await session.endSession();
        }
      } else if (status !== claim.status) {
        const item = await Item.findById(claim.item);
        if (!item || item.status !== "Approved") return NextResponse.json({ error: "This item's claims can no longer be reviewed." }, { status: 409 });
        claim.status = status as "Pending" | "Rejected";
        claim.reviewedBy = new mongoose.Types.ObjectId(user.id);
        claim.reviewedAt = new Date();
        await claim.save();
      }
    } else {
      if (String(claim.claimant) !== user.id) return NextResponse.json({ error: "You can only edit your own claims." }, { status: 403 });
      if (claim.status !== "Pending") return NextResponse.json({ error: "Only pending claims can be edited." }, { status: 400 });
      Object.assign(claim, claimSchema.parse(await request.json()));
      await claim.save();
    }
    const populated = await Claim.findById(claim._id).populate("item", "title type status imageUrl").populate("claimant", "name email").lean();
    return jsonOk({ claim: populated ? serializeClaim(populated, user.role === "Admin") : null });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const id = objectIdSchema.parse((await context.params).id);
    await connectDB();
    const claim = await Claim.findById(id);
    if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    if (user.role !== "Admin" && String(claim.claimant) !== user.id) return NextResponse.json({ error: "You cannot delete this claim." }, { status: 403 });
    if (claim.status === "Approved") return NextResponse.json({ error: "Approved claims are retained as the record of a returned item." }, { status: 409 });
    await Claim.findByIdAndDelete(id);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
