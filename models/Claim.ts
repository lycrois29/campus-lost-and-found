import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const claimSchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    claimant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 1500 },
    proof: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

claimSchema.index({ item: 1, claimant: 1 }, { unique: true });

export type ClaimDocument = InferSchemaType<typeof claimSchema> & mongoose.Document;
const Claim = (mongoose.models.Claim as Model<ClaimDocument>) || mongoose.model<ClaimDocument>("Claim", claimSchema);
export default Claim;
