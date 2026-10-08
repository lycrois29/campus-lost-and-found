"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import ReportForm from "@/components/ReportForm";
import { apiFetch } from "@/lib/client";
import type { Item } from "@/lib/types";
import { LoadingState } from "@/components/LoadingState";

function EditContent({ id }: { id: string }) { const [item, setItem] = useState<Item | null>(null); const [error, setError] = useState(""); useEffect(() => { void apiFetch<{ item: Item }>(`/api/items/${id}`).then((data) => setItem(data.item)).catch((e) => setError(e.message)); }, [id]); if (error) return <div className="alert error">{error}</div>; if (!item) return <LoadingState label="Loading report" />; return <div className="container narrow page-space"><Link href={`/items/${id}`} className="back-link">← Back to report</Link><div className="page-heading compact"><div><span className="eyebrow">Update your report</span><h1>Edit item</h1><p>Changes will be reviewed again by an admin.</p></div></div><ReportForm item={item} /></div>; }
export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) { const [id, setId] = useState<string | null>(null); useEffect(() => { void params.then((value) => setId(value.id)); }, [params]); return <RequireAuth>{id ? <EditContent id={id} /> : <LoadingState label="Loading" />}</RequireAuth>; }
