import test from "node:test";
import assert from "node:assert/strict";
import { claimSchema, escapeRegex, itemQuerySchema, itemSchema, objectIdSchema, registerSchema } from "../lib/validation";
import { serializeClaim, serializeItem } from "../lib/serializers";
import { assertSameOrigin } from "../lib/api";

test("new passwords require at least twelve characters", () => {
  assert.equal(registerSchema.safeParse({ name: "Student", email: "student@au.edu", password: "short123" }).success, false);
  assert.equal(registerSchema.safeParse({ name: "Student", email: "student@au.edu", password: "long-unique-passphrase" }).success, true);
});

test("report images must use HTTPS without embedded credentials", () => {
  const report = { title: "Blue backpack", description: "A blue backpack near the library", type: "Lost", categoryId: "507f1f77bcf86cd799439011", location: "Library", dateOccurred: "2025-01-01" };
  assert.equal(itemSchema.safeParse({ ...report, imageUrl: "http://example.com/image.jpg" }).success, false);
  assert.equal(itemSchema.safeParse({ ...report, imageUrl: "https://user:pass@example.com/image.jpg" }).success, false);
  assert.equal(itemSchema.safeParse({ ...report, imageUrl: "https://example.com/image.jpg" }).success, true);
});

test("search filters are bounded and regex input is escaped", () => {
  assert.equal(escapeRegex("(.*)"), "\\(\\.\\*\\)");
  assert.equal(itemQuerySchema.safeParse({ limit: 101 }).success, false);
  assert.equal(itemQuerySchema.safeParse({ search: "x".repeat(81) }).success, false);
  assert.equal(objectIdSchema.safeParse("not-an-id").success, false);
});

test("public item payload never contains reporter email", () => {
  const item = serializeItem({ _id: "item1", title: "Book", reportedBy: { _id: "user1", name: "Student", email: "private@au.edu" }, category: { _id: "cat1", name: "Books" } });
  assert.deepEqual(item.reportedBy, { id: "user1", name: "Student" });
  assert.equal(JSON.stringify(item).includes("private@au.edu"), false);
});

test("only admin claim payload exposes claimant email", () => {
  const claim = { _id: "claim1", claimant: { _id: "user1", name: "Student", email: "private@au.edu" }, item: { _id: "item1", title: "Phone", type: "Found", status: "Approved" } };
  assert.equal(JSON.stringify(serializeClaim(claim, false)).includes("private@au.edu"), false);
  assert.equal(JSON.stringify(serializeClaim(claim, true)).includes("private@au.edu"), true);
  assert.equal(claimSchema.safeParse({ message: "My phone is black with a red case", proof: "javascript:alert(1)" }).success, false);
});

test("mutation origin check rejects cross-site and missing origins", () => {
  assert.doesNotThrow(() => assertSameOrigin(new Request("https://campus.example/api/items", { method: "POST", headers: { origin: "https://campus.example" } })));
  assert.throws(() => assertSameOrigin(new Request("https://campus.example/api/items", { method: "POST", headers: { origin: "https://attacker.example" } })));
  assert.throws(() => assertSameOrigin(new Request("https://campus.example/api/items", { method: "POST" })));
});

test("mutation origin check allows the configured public origin behind a proxy", () => {
  const originalOrigin = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = "https://campus.example";
  try {
    const internalUrl = "http://127.0.0.1:3000/api/auth/login";
    assert.doesNotThrow(() => assertSameOrigin(new Request(internalUrl, { method: "POST", headers: { origin: "https://campus.example" } })));
    assert.throws(() => assertSameOrigin(new Request(internalUrl, { method: "POST", headers: { origin: "https://attacker.example", "x-forwarded-host": "campus.example" } })));
    assert.throws(() => assertSameOrigin(new Request(internalUrl, { method: "POST" })));
  } finally {
    if (originalOrigin === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = originalOrigin;
  }
});
