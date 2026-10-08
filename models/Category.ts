import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 60 },
    description: { type: String, default: "", maxlength: 200 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export type CategoryDocument = InferSchemaType<typeof categorySchema> & mongoose.Document;
const Category = (mongoose.models.Category as Model<CategoryDocument>) || mongoose.model<CategoryDocument>("Category", categorySchema);
export default Category;
