import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, jsonError, jsonOk } from "@/lib/api";
import { serializeClaim } from "@/lib/serializers";
import { claimSchema, objectIdSchema, pageQuerySchema } from "@/lib/validation";
import Claim from "@/models/Claim";
import Item from "@/models/Item";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { page, limit } = pageQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    await connectDB();
    const filter = user.role === "Admin" ? {} : { claimant: user.id };
    const [total, claims] = await Promise.all([
      Claim.countDocuments(filter),
      Claim.find(filter).populate("item", "title type status imageUrl").populate("claimant", "name email")
        .sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);
    return jsonOk({ claims: claims.map((claim) => serializeClaim(claim, user.role === "Admin")), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(["Student"]);
    const body = await request.json();
    const input = claimSchema.parse(body);
    const itemId = objectIdSchema.parse(body.itemId);
    await connectDB();
    const item = await Item.findOne({ _id: itemId, type: "Found", status: "Approved" });
    if (!item) return NextResponse.json({ error: "Only approved found items can be claimed." }, { status: 400 });
    if (String(item.reportedBy) === user.id) return NextResponse.json({ error: "You cannot claim your own report." }, { status: 400 });
    const existing = await Claim.findOne({ item: itemId, claimant: user.id });
    if (existing) return NextResponse.json({ error: "You have already submitted a claim for this item." }, { status: 409 });
    const claim = await Claim.create({ ...input, item: itemId, claimant: user.id });
    const populated = await Claim.findById(claim._id).populate("item", "title type status imageUrl").populate("claimant", "name email").lean();
    return jsonOk({ claim: serializeClaim(populated, false) }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
