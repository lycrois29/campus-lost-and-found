"use client";

import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { apiFetch } from "@/lib/client";

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      await apiFetch("/api/auth/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
      setCurrentPassword(""); setNewPassword("");
      setSuccess("Password changed. Other signed-in sessions have been revoked.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not change password"); }
    finally { setSaving(false); }
  };
  return <RequireAuth><div className="container page-space"><div className="auth-card account-card"><span className="eyebrow">Account security</span><h1>Change password</h1><p>Use a unique password of at least 12 characters. Changing it signs out other sessions.</p><form className="auth-form" onSubmit={submit}><label className="field"><span>Current password</span><input type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label><label className="field"><span>New password</span><input type="password" autoComplete="new-password" minLength={12} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>{error && <div className="alert error">{error}</div>}{success && <div className="alert success">{success}</div>}<button className="button" disabled={saving}>{saving ? "Saving…" : "Change password"}</button></form></div></div></RequireAuth>;
}
