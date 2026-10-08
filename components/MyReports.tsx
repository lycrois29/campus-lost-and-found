"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, formatDate } from "@/lib/client";
import type { Item } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState, LoadingState } from "@/components/LoadingState";
import Pagination, { type PaginationInfo } from "@/components/Pagination";

export default function MyReports() {
  const [items, setItems] = useState<Item[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [page, setPage] = useState(1); const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const load = async () => { setLoading(true); try { const data = await apiFetch<{ items: Item[]; pagination: PaginationInfo }>(`/api/items?mine=1&page=${page}`); setItems(data.items); setPagination(data.pagination); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load reports"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [page]);
  const remove = async (id: string) => { if (!window.confirm("Delete this report?")) return; try { await apiFetch(`/api/items/${id}`, { method: "DELETE" }); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to delete report"); } };
  if (loading) return <LoadingState label="Loading your reports" />;
  if (error) return <div className="alert error">{error}</div>;
  if (!items.length) return <EmptyState title="No reports yet" detail="When you report a lost or found item, it will appear here." action={<Link className="button" href="/reports/new">Report an item</Link>} />;
  return <><div className="table-wrap"><table><thead><tr><th>Item</th><th>Type</th><th>Location</th><th>Date</th><th>Status</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><Link className="table-title" href={`/items/${item.id}`}>{item.title}</Link></td><td><span className={`type-label ${item.type.toLowerCase()}`}>{item.type}</span></td><td>{item.location}</td><td>{formatDate(item.dateOccurred)}</td><td><StatusBadge status={item.status} /></td><td><div className="table-actions"><Link href={`/items/${item.id}/edit`}>Edit</Link><button className="danger-link" onClick={() => void remove(item.id)}>Delete</button></div></td></tr>)}</tbody></table></div>{pagination && <Pagination info={pagination} onPage={setPage} />}</>;
}
