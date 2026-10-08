"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client";
import type { Category, Item } from "@/lib/types";
import ItemCard from "@/components/ItemCard";
import { EmptyState, LoadingState } from "@/components/LoadingState";
import Pagination, { type PaginationInfo } from "@/components/Pagination";

export default function ItemExplorer({ admin = false }: { admin?: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [filters, setFilters] = useState({ search: "", type: "All", category: "All", location: "", from: "", to: "" });

  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== "All"));
      params.set("page", String(page));
      const data = await apiFetch<{ items: Item[]; pagination: PaginationInfo }>(`/api/items?${params}`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load items"); } finally { setLoading(false); }
  };
  useEffect(() => { void apiFetch<{ categories: Category[] }>("/api/categories").then((data) => setCategories(data.categories)).catch(() => undefined); }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 200); return () => window.clearTimeout(timer); }, [filters, page]);
  const update = (key: keyof typeof filters, value: string) => { setPage(1); setFilters((current) => ({ ...current, [key]: value })); };
  return <section>
    <div className="filter-panel">
      <div className="search-wrap"><span>⌕</span><input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Search item, place, or description" /></div>
      <select value={filters.type} onChange={(event) => update("type", event.target.value)}><option>All</option><option>Lost</option><option>Found</option></select>
      <select value={filters.category} onChange={(event) => update("category", event.target.value)}><option value="All">All categories</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>
      <input value={filters.location} onChange={(event) => update("location", event.target.value)} placeholder="Location" />
      <label className="date-field"><span>From</span><input type="date" value={filters.from} onChange={(event) => update("from", event.target.value)} /></label>
      <label className="date-field"><span>To</span><input type="date" value={filters.to} onChange={(event) => update("to", event.target.value)} /></label>
    </div>
    {error && <div className="alert error">{error}</div>}
    {loading ? <LoadingState label="Finding reports" /> : items.length === 0 ? <EmptyState title="No matching reports" detail="Try changing your filters or check back later." /> : <div className="item-grid">{items.map((item) => <ItemCard key={item.id} item={item} admin={admin} />)}</div>}
    {!loading && pagination && <Pagination info={pagination} onPage={setPage} />}
  </section>;
}
