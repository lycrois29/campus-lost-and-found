import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export type UserRole = "Student" | "Admin";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["Student", "Admin"], default: "Student" },
    isApproved: { type: Boolean, default: false },
    sessionVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof userSchema> & mongoose.Document;
const User = (mongoose.models.User as Model<UserDocument>) || mongoose.model<UserDocument>("User", userSchema);
export default User;
