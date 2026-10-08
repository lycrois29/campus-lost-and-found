import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/api";
import { categorySchema, objectIdSchema } from "@/lib/validation";
import Category from "@/models/Category";
import Item from "@/models/Item";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    await requireUser(["Admin"]);
    const id = objectIdSchema.parse((await context.params).id);
    const input = categorySchema.parse(await request.json());
    await connectDB();
    const category = await Category.findByIdAndUpdate(id, input, { new: true, runValidators: true }).lean();
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return jsonOk({ category: { ...category, id: String(category._id) } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    await requireUser(["Admin"]);
    const id = objectIdSchema.parse((await context.params).id);
    await connectDB();
    const itemCount = await Item.countDocuments({ category: id });
    if (itemCount > 0) return NextResponse.json({ error: "This category is used by reports. Edit or archive it instead." }, { status: 400 });
    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
