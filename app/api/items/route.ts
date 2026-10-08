import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUser, requireUser } from "@/lib/auth";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/api";
import { serializeItem } from "@/lib/serializers";
import { escapeRegex, itemQuerySchema, itemSchema } from "@/lib/validation";
import Category from "@/models/Category";
import Item from "@/models/Item";

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    const input = itemQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const mine = input.mine === "1";
    if (mine && !session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (input.from && input.to && input.from > input.to) return NextResponse.json({ error: "From date must be before To date." }, { status: 400 });
    await connectDB();

    const query: Record<string, any> = {};
    if (mine) query.reportedBy = session!.id;
    else if (session?.role !== "Admin") query.status = "Approved";
    else if (input.status && input.status !== "All") query.status = input.status;
    if (input.type && input.type !== "All") query.type = input.type;
    if (input.category && input.category !== "All") query.category = input.category;
    if (input.location) query.location = { $regex: escapeRegex(input.location), $options: "i" };
    if (input.search) {
      const pattern = escapeRegex(input.search);
      query.$or = ["title", "description", "location"].map((field) => ({ [field]: { $regex: pattern, $options: "i" } }));
    }
    if (input.from || input.to) {
      query.dateOccurred = {};
      if (input.from) query.dateOccurred.$gte = new Date(`${input.from}T00:00:00.000Z`);
      if (input.to) query.dateOccurred.$lte = new Date(`${input.to}T23:59:59.999Z`);
    }

    const [total, items] = await Promise.all([
      Item.countDocuments(query),
      Item.find(query).populate("category", "name").populate("reportedBy", "name")
        .sort({ createdAt: -1, _id: -1 }).skip((input.page - 1) * input.limit).limit(input.limit).lean(),
    ]);
    return jsonOk({ items: items.map(serializeItem), pagination: { page: input.page, limit: input.limit, total, totalPages: Math.ceil(total / input.limit) } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const input = itemSchema.parse(await request.json());
    await connectDB();
    const category = await Category.findOne({ _id: input.categoryId, isActive: true });
    if (!category) return NextResponse.json({ error: "Choose an active category." }, { status: 400 });
    const item = await Item.create({ ...input, category: input.categoryId, dateOccurred: new Date(input.dateOccurred), reportedBy: user.id, status: user.role === "Admin" ? "Approved" : "Pending" });
    const populated = await Item.findById(item._id).populate("category", "name").populate("reportedBy", "name").lean();
    return jsonOk({ item: serializeItem(populated) }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
