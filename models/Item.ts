import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const itemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    type: { type: String, enum: ["Lost", "Found"], required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    dateOccurred: { type: Date, required: true },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Collected", "Returned"], default: "Pending" },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

itemSchema.index({ status: 1, createdAt: -1 });
itemSchema.index({ title: "text", description: "text", location: "text" });

export type ItemDocument = InferSchemaType<typeof itemSchema> & mongoose.Document;
const Item = (mongoose.models.Item as Model<ItemDocument>) || mongoose.model<ItemDocument>("Item", itemSchema);
export default Item;
