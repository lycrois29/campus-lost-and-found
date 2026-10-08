"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client";

export default function ClaimForm({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [proof, setProof] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try { await apiFetch("/api/claims", { method: "POST", body: JSON.stringify({ itemId, message, proof }) }); router.push("/claims"); } catch (e) { setError(e instanceof Error ? e.message : "Could not submit claim"); } finally { setSaving(false); }
  };
  return <form className="claim-form" onSubmit={submit}>
    <h3>Is this yours?</h3><p>Tell the admin why you believe this found item belongs to you. Your claim will be reviewed privately.</p>
    <label className="field"><span>Claim details</span><textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe a detail only the owner would know…" /></label>
    <label className="field"><span>Proof link <em>optional</em></span><input type="url" value={proof} onChange={(e) => setProof(e.target.value)} placeholder="Link to a photo or document" /></label>
    <p>Do not link to identity documents or sensitive personal information. An HTTPS proof link may be accessible to anyone who knows the link.</p>
    {error && <div className="alert error">{error}</div>}<button className="button" disabled={saving}>{saving ? "Submitting…" : "Submit claim"}</button>
  </form>;
}
