"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter(); const { refresh } = useAuth(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); setError(""); try { await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); await refresh(); router.push("/dashboard"); } catch (e) { setError(e instanceof Error ? e.message : "Could not log in"); } finally { setSaving(false); } };
  return <div className="auth-page"><div className="auth-card"><span className="eyebrow">Welcome back</span><h1>Log in to CampusFind</h1><p>Use your campus account to report items and track claims.</p><form onSubmit={submit} className="auth-form"><label className="field"><span>Email</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@campus.edu" /></label><label className="field"><span>Password</span><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" /></label>{error && <div className="alert error">{error}</div>}<button className="button button-wide" disabled={saving}>{saving ? "Logging in…" : "Log in"}</button></form><p className="auth-switch">New to CampusFind? <Link href="/register">Create an account</Link></p></div></div>;
}
