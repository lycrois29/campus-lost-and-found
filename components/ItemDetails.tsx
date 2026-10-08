"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, formatDate } from "@/lib/client";
import type { Item } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import RequireAuth from "@/components/RequireAuth";
import ClaimForm from "@/components/ClaimForm";
import StatusBadge from "@/components/StatusBadge";
import { LoadingState } from "@/components/LoadingState";

export default function ItemDetails({ id }: { id: string }) {
  const { user } = useAuth(); const router = useRouter(); const [item, setItem] = useState<Item | null>(null); const [error, setError] = useState(""); const [removing, setRemoving] = useState(false);
  useEffect(() => { void apiFetch<{ item: Item }>(`/api/items/${id}`).then((data) => setItem(data.item)).catch((e) => setError(e.message)); }, [id]);
  const remove = async () => { if (!window.confirm("Delete this report?")) return; setRemoving(true); try { await apiFetch(`/api/items/${id}`, { method: "DELETE" }); router.push("/my-reports"); } catch (e) { setError(e instanceof Error ? e.message : "Unable to delete report"); } finally { setRemoving(false); } };
  if (error) return <div className="container page-space"><div className="state-card unauthorized"><div className="empty-icon">!</div><h2>Report unavailable</h2><p>{error}</p><Link href="/browse" className="button">Back to browse</Link></div></div>;
  if (!item) return <div className="container page-space"><LoadingState label="Loading report" /></div>;
  const isOwner = user?.id === item.reportedBy?.id;
  return <div className="container narrow-wide page-space"><Link href="/browse" className="back-link">← Back to browse</Link><div className="detail-layout"><div className="detail-visual">{item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <div className={`detail-placeholder ${item.type.toLowerCase()}`}><span>{item.type === "Lost" ? "?" : "✓"}</span><small>No image added</small></div>}</div><div className="detail-content"><div className="item-card-top"><span className={`type-label ${item.type.toLowerCase()}`}>{item.type}</span><StatusBadge status={item.status} /></div><h1>{item.title}</h1><p className="detail-description">{item.description}</p><div className="detail-facts"><div><span>Category</span><strong>{item.category?.name ?? "Uncategorised"}</strong></div><div><span>Location</span><strong>{item.location}</strong></div><div><span>Date reported</span><strong>{formatDate(item.dateOccurred)}</strong></div><div><span>Shared by</span><strong>{item.reportedBy?.name ?? "Campus user"}</strong></div></div>{isOwner && <div className="detail-actions"><Link className="button button-small" href={`/items/${item.id}/edit`}>Edit report</Link><button className="button button-small button-danger" disabled={removing} onClick={() => void remove()}>{removing ? "Deleting…" : "Delete"}</button></div>}{!isOwner && item.type === "Found" && item.status === "Approved" && user?.role === "Student" && <ClaimForm itemId={item.id} />}{!user && item.type === "Found" && item.status === "Approved" && <div className="claim-login"><strong>Think this is yours?</strong><p>Log in to submit a claim for this item.</p><Link className="button button-small" href="/login">Log in to claim</Link></div>}</div></div></div>;
}
