import mongoose, { Schema, type Model } from "mongoose";

type RateLimitDocument = mongoose.Document & { key: string; count: number; expiresAt: Date };

const rateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});

rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default (mongoose.models.RateLimit as Model<RateLimitDocument>) || mongoose.model<RateLimitDocument>("RateLimit", rateLimitSchema);
