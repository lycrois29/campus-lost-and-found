import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUser, requireUser } from "@/lib/auth";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/api";
import { serializeItem } from "@/lib/serializers";
import { itemSchema, objectIdSchema, statusSchema } from "@/lib/validation";
import Category from "@/models/Category";
import Claim from "@/models/Claim";
import Item from "@/models/Item";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const id = objectIdSchema.parse((await context.params).id);
    await connectDB();
    const item = await Item.findById(id).populate("category", "name").populate("reportedBy", "name").lean();
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    const session = await getSessionUser();
    const isOwner = session?.id === String((item.reportedBy as any)?._id);
    if (item.status !== "Approved" && session?.role !== "Admin" && !isOwner) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return jsonOk({ item: serializeItem(item) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const id = objectIdSchema.parse((await context.params).id);
    await connectDB();
    const item = await Item.findById(id);
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    const isOwner = String(item.reportedBy) === user.id;
    if (!isOwner && user.role !== "Admin") return NextResponse.json({ error: "You can only edit your own reports." }, { status: 403 });
    const body = await request.json();
    if (user.role === "Admin" && body.status) {
      const status = statusSchema.parse({ status: body.status }).status;
      if (await Claim.exists({ item: id, status: "Approved" }) && status !== "Returned") return NextResponse.json({ error: "A completed claim keeps this report marked as returned." }, { status: 409 });
      if (["Collected", "Returned", "Rejected"].includes(status) && await Claim.exists({ item: id, status: "Pending" })) return NextResponse.json({ error: "Review pending claims before closing this report." }, { status: 409 });
      item.status = status;
      item.reviewedBy = user.id as any;
      item.reviewedAt = new Date();
      if (body.title || body.description || body.type || body.categoryId || body.location || body.dateOccurred) {
        if (await Claim.exists({ item: id })) return NextResponse.json({ error: "Reports with claims cannot be edited." }, { status: 409 });
        const input = itemSchema.parse(body);
        const category = await Category.findOne({ _id: input.categoryId, isActive: true });
        if (!category) return NextResponse.json({ error: "Choose an active category." }, { status: 400 });
        Object.assign(item, { ...input, category: input.categoryId, dateOccurred: new Date(input.dateOccurred) });
      }
    } else {
      if (["Collected", "Returned"].includes(item.status) || await Claim.exists({ item: id })) return NextResponse.json({ error: "A completed or claimed report cannot be edited." }, { status: 409 });
      const input = itemSchema.parse(body);
      const category = await Category.findOne({ _id: input.categoryId, isActive: true });
      if (!category) return NextResponse.json({ error: "Choose an active category." }, { status: 400 });
      Object.assign(item, { ...input, category: input.categoryId, dateOccurred: new Date(input.dateOccurred), status: "Pending" });
      item.reviewedBy = undefined;
      item.reviewedAt = undefined;
    }
    await item.save();
    const updated = await Item.findById(item._id).populate("category", "name").populate("reportedBy", "name").lean();
    return jsonOk({ item: serializeItem(updated) });
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
    const item = await Item.findById(id);
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (String(item.reportedBy) !== user.id && user.role !== "Admin") return NextResponse.json({ error: "You can only delete your own reports." }, { status: 403 });
    if (await Claim.exists({ item: id })) return NextResponse.json({ error: "This report has claims. Resolve them before deleting it." }, { status: 409 });
    await Item.findByIdAndDelete(id);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
