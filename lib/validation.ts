import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const httpsUrl = z.string().max(2048).url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password;
}, "Use a public HTTPS link without a username or password");

const optionalHttpsUrl = z.union([httpsUrl, z.literal("")]).optional();

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date").refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date.getTime() <= Date.now() + 86_400_000;
}, "Date cannot be invalid or in the future");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
  password: z.string().min(12, "Password must be at least 12 characters").max(72),
});

export const loginSchema = z.object({ email: z.string().trim().email().toLowerCase(), password: z.string().min(1) });
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12).max(72),
}).refine((value) => value.currentPassword !== value.newPassword, { message: "Choose a different password" });

export const itemSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  type: z.enum(["Lost", "Found"]),
  categoryId: objectIdSchema,
  location: z.string().trim().min(2, "Add a location").max(120),
  dateOccurred: dateString,
  imageUrl: optionalHttpsUrl,
});

export const claimSchema = z.object({
  message: z.string().trim().min(10, "Please explain why this item belongs to you").max(1500),
  proof: optionalHttpsUrl,
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(60),
  description: z.string().trim().max(200).optional().default(""),
});

export const statusSchema = z.object({ status: z.enum(["Pending", "Approved", "Rejected", "Collected", "Returned"]) });

export const itemQuerySchema = z.object({
  mine: z.enum(["0", "1"]).optional(),
  status: z.enum(["All", "Pending", "Approved", "Rejected", "Collected", "Returned"]).optional(),
  type: z.enum(["All", "Lost", "Found"]).optional(),
  category: z.union([objectIdSchema, z.literal("All")]).optional(),
  location: z.string().trim().max(80).optional(),
  search: z.string().trim().max(80).optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
