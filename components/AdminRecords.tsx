"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, formatDate } from "@/lib/client";
import type { Claim, Item } from "@/lib/types";
import { EmptyState, LoadingState } from "@/components/LoadingState";
import Pagination, { type PaginationInfo } from "@/components/Pagination";
import StatusBadge from "@/components/StatusBadge";

export default function AdminRecords({ kind }: { kind: "reports" | "claims" }) {
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      if (kind === "reports") {
        const data = await apiFetch<{ items: Item[]; pagination: PaginationInfo }>(`/api/items?page=${page}`);
        setItems(data.items); setPagination(data.pagination);
      } else {
        const data = await apiFetch<{ claims: Claim[]; pagination: PaginationInfo }>(`/api/claims?page=${page}`);
        setClaims(data.claims); setPagination(data.pagination);
      }
      setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load records"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [kind, page]);

  async function update(id: string, status: string) {
    if (!window.confirm(`Mark this ${kind === "reports" ? "report" : "claim"} ${status.toLowerCase()}?`)) return;
    try {
      await apiFetch(`/api/${kind === "reports" ? "items" : "claims"}/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to update record"); }
  }

  return <>
    <Link className="back-link" href="/admin">← Admin dashboard</Link>
    <div className="page-heading"><div><span className="eyebrow">Moderation</span><h1>All {kind}</h1><p>Review records page by page.</p></div></div>
    {error && <div className="alert error" role="alert">{error}</div>}
    {loading ? <LoadingState label={`Loading ${kind}`} /> : kind === "reports" ? items.length ?
      <div className="table-wrap"><table><thead><tr><th>Report</th><th>Reporter</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}>
        <td><Link className="table-title" href={`/items/${item.id}`}>{item.title}</Link><small className="table-sub">{item.type} · {item.location} · {formatDate(item.dateOccurred)}</small></td>
        <td>{item.reportedBy?.name ?? "Unknown"}</td><td><StatusBadge status={item.status} /></td>
        <td><div className="table-actions">
          {(item.status === "Pending" || item.status === "Rejected") && <button className="approve-link" onClick={() => void update(item.id, "Approved")}>Approve</button>}
          {item.status === "Pending" && <button className="danger-link" onClick={() => void update(item.id, "Rejected")}>Reject</button>}
          {item.status === "Approved" && <><button className="text-button" onClick={() => void update(item.id, "Collected")}>Collected</button><button className="text-button" onClick={() => void update(item.id, "Returned")}>Returned</button></>}
        </div></td>
      </tr>)}</tbody></table></div> : <EmptyState title="No reports" /> : claims.length ?
      <div className="claim-review-list">{claims.map((claim) => <article className="review-card" key={claim.id}><div><div className="item-card-top"><span className="type-label found">Claim</span><StatusBadge status={claim.status} /></div><h3>{claim.item?.title ?? "Unavailable item"}</h3><p>{claim.message}</p>{claim.proof && <a href={claim.proof} target="_blank" rel="noreferrer" className="text-link">View proof</a>}<small>{claim.claimant?.name ?? "Unknown"} · {claim.claimant?.email ?? ""}</small></div>{claim.status === "Pending" && <div className="review-actions"><button className="button button-small" onClick={() => void update(claim.id, "Approved")}>Approve</button><button className="button button-small button-danger" onClick={() => void update(claim.id, "Rejected")}>Reject</button></div>}</article>)}</div> : <EmptyState title="No claims" />}
    {!loading && pagination && <Pagination info={pagination} onPage={setPage} />}
  </>;
}
