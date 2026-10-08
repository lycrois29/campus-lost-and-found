import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import Category from "@/models/Category";

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!name || !email || !password) throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running the seed command.");
  if (password.length < 12 || password === "ChangeMe123!") throw new Error("Set ADMIN_PASSWORD to a unique password of at least 12 characters before seeding.");
  await connectDB();
  const passwordHash = await hashPassword(password);
  const admin = await User.findOneAndUpdate({ email }, { name, email, passwordHash, role: "Admin", isApproved: true }, { upsert: true, new: true, setDefaultsOnInsert: true });
  const defaults = [
    ["Electronics", "Phones, laptops, chargers, and other devices"],
    ["Cards & IDs", "Student IDs, bank cards, and passes"],
    ["Clothing", "Jackets, hats, shoes, and accessories"],
    ["Books & Stationery", "Books, notebooks, and study supplies"],
    ["Bags", "Backpacks, purses, and cases"],
    ["Other", "Anything that does not fit another category"],
  ];
  for (const [categoryName, description] of defaults) await Category.updateOne({ name: categoryName }, { $setOnInsert: { name: categoryName, description, createdBy: admin._id, isActive: true } }, { upsert: true });
  console.log(`Admin ready: ${admin.email}`);
  console.log("Default categories ensured.");
  await (await import("mongoose")).default.disconnect();
}

main().catch(async (error) => { console.error(error); process.exitCode = 1; });
