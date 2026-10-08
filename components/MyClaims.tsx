"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, formatDate } from "@/lib/client";
import type { Claim } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState, LoadingState } from "@/components/LoadingState";
import Pagination, { type PaginationInfo } from "@/components/Pagination";

export default function MyClaims() {
  const [claims, setClaims] = useState<Claim[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [editing, setEditing] = useState<string | null>(null); const [message, setMessage] = useState("");
  const [page, setPage] = useState(1); const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const load = async () => { setLoading(true); try { const data = await apiFetch<{ claims: Claim[]; pagination: PaginationInfo }>(`/api/claims?page=${page}`); setClaims(data.claims); setPagination(data.pagination); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load claims"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [page]);
  const remove = async (id: string) => { if (!window.confirm("Delete this claim?")) return; try { await apiFetch(`/api/claims/${id}`, { method: "DELETE" }); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to delete claim"); } };
  const save = async (id: string) => { try { await apiFetch(`/api/claims/${id}`, { method: "PATCH", body: JSON.stringify({ message, proof: "" }) }); setEditing(null); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to edit claim"); } };
  if (loading) return <LoadingState label="Loading your claims" />;
  if (error) return <div className="alert error">{error}</div>;
  if (!claims.length) return <EmptyState title="No claims yet" detail="When you claim a found item, its review status will appear here." action={<Link className="button" href="/browse">Browse found items</Link>} />;
  return <><div className="claim-list">{claims.map((claim) => <article className="claim-card" key={claim.id}><div className="claim-card-main"><div className="item-card-top"><span className="type-label found">Found item</span><StatusBadge status={claim.status} /></div><h3>{claim.item ? <Link href={`/items/${claim.item.id}`}>{claim.item.title}</Link> : "Deleted item"}</h3>{editing === claim.id ? <textarea className="inline-editor" value={message} onChange={(e) => setMessage(e.target.value)} /> : <p>{claim.message}</p>}<small>Submitted {claim.createdAt ? formatDate(claim.createdAt) : "recently"}</small></div><div className="claim-actions">{claim.status === "Pending" && (editing === claim.id ? <><button className="button button-small" onClick={() => void save(claim.id)}>Save</button><button className="link-button" onClick={() => setEditing(null)}>Cancel</button></> : <><button className="text-button" onClick={() => { setEditing(claim.id); setMessage(claim.message); }}>Edit</button><button className="danger-link" onClick={() => void remove(claim.id)}>Delete</button></>)}</div></article>)}</div>{pagination && <Pagination info={pagination} onPage={setPage} />}</>;
}
