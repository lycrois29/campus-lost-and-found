import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUser, requireUser } from "@/lib/auth";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/api";
import { categorySchema, escapeRegex } from "@/lib/validation";
import Category from "@/models/Category";

export async function GET(request: Request) {
  try {
    await connectDB();
    const session = await getSessionUser();
    const all = new URL(request.url).searchParams.get("all") === "1";
    const categories = await Category.find(all && session?.role === "Admin" ? {} : { isActive: true }).sort({ name: 1 }).lean();
    return jsonOk({ categories: categories.map((category) => ({ ...category, id: String(category._id) })) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(["Admin"]);
    const input = categorySchema.parse(await request.json());
    await connectDB();
    const existing = await Category.findOne({ name: { $regex: `^${escapeRegex(input.name)}$`, $options: "i" } });
    if (existing) return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
    const category = await Category.create({ ...input, createdBy: user.id });
    return jsonOk({ category: { ...category.toObject(), id: String(category._id) } }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
