"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client";
import type { Category, Item } from "@/lib/types";

export default function ReportForm({ item }: { item?: Item }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ title: item?.title ?? "", description: item?.description ?? "", type: item?.type ?? "Lost", categoryId: item?.category?.id ?? "", location: item?.location ?? "", dateOccurred: item?.dateOccurred ? item.dateOccurred.slice(0, 10) : new Date().toISOString().slice(0, 10), imageUrl: item?.imageUrl ?? "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { void apiFetch<{ categories: Category[] }>("/api/categories").then((data) => setCategories(data.categories)).catch((e) => setError(e.message)); }, []);
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      await apiFetch(item ? `/api/items/${item.id}` : "/api/items", { method: item ? "PATCH" : "POST", body: JSON.stringify(form) });
      router.push(item ? `/items/${item.id}` : "/my-reports"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save report"); } finally { setSaving(false); }
  };
  return <form className="form-card" onSubmit={submit}>
    <div className="form-grid">
      <label className="field full"><span>Report title</span><input required value={form.title} onChange={(e) => change("title", e.target.value)} placeholder="e.g. Blue water bottle" /></label>
      <label className="field"><span>Report type</span><select value={form.type} onChange={(e) => change("type", e.target.value)}><option>Lost</option><option>Found</option></select></label>
      <label className="field"><span>Category</span><select required value={form.categoryId} onChange={(e) => change("categoryId", e.target.value)}><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="field"><span>Location</span><input required value={form.location} onChange={(e) => change("location", e.target.value)} placeholder="e.g. Library, level 2" /></label>
      <label className="field"><span>Date</span><input required type="date" value={form.dateOccurred} onChange={(e) => change("dateOccurred", e.target.value)} /></label>
      <label className="field full"><span>Description</span><textarea required rows={5} value={form.description} onChange={(e) => change("description", e.target.value)} placeholder="Add useful details such as colour, brand, or identifying marks." /></label>
      <label className="field full"><span>Image URL <em>optional</em></span><input type="url" value={form.imageUrl} onChange={(e) => change("imageUrl", e.target.value)} placeholder="https://…" /></label>
    </div>
    <p className="muted">Approved reports are public. Do not include ID numbers, phone numbers, faces, or private details in the description or image.</p>
    {error && <div className="alert error">{error}</div>}
    <div className="form-actions"><button className="button" disabled={saving}>{saving ? "Saving…" : item ? "Save changes" : "Submit report"}</button><button type="button" className="button button-ghost" onClick={() => router.back()}>Cancel</button></div>
  </form>;
}
