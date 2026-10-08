"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, formatDate } from "@/lib/client";
import { EmptyState, LoadingState } from "@/components/LoadingState";

type Student = { id: string; name: string; email: string; role: "Student" | "Admin"; isApproved: boolean; createdAt: string };

export default function StudentVerification() {
  const [users, setUsers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await apiFetch<{ users: Student[] }>("/api/admin/users");
      setUsers(data.users.filter((user) => user.role === "Student"));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load accounts"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function setApproved(user: Student, isApproved: boolean) {
    const prompt = isApproved
      ? `Have you independently verified that ${user.name} controls ${user.email} and is a current student? Approve only after checking with an official campus source.`
      : `Suspend ${user.name}? Their current session will stop working.`;
    if (!window.confirm(prompt)) return;
    setBusyId(user.id); setError("");
    try {
      await apiFetch(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ isApproved }) });
      await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to update account"); }
    finally { setBusyId(null); }
  }

  const pending = users.filter((user) => !user.isApproved);
  const approved = users.filter((user) => user.isApproved);
  return <>
    <Link className="back-link" href="/admin">← Admin dashboard</Link>
    <div className="page-heading"><div><span className="eyebrow">Access control</span><h1>Verify students</h1><p>New accounts cannot sign in until an admin approves them.</p></div></div>
    <div className="helper-note"><span>!</span><div><strong>An @au.edu address is not proof of ownership.</strong><br />Before approval, confirm the student’s identity using an official university channel or in person. Never approve based only on the name and email shown here.</div></div>
    {error && <div className="alert error" role="alert">{error}</div>}
    {loading ? <LoadingState label="Loading student accounts" /> : <>
      <h2>Awaiting verification ({pending.length})</h2>
      {pending.length ? <div className="table-wrap"><table><thead><tr><th>Student</th><th>Registered</th><th>Action</th></tr></thead><tbody>{pending.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><small className="table-sub">{user.email}</small></td><td>{formatDate(user.createdAt)}</td><td><button className="button button-small" disabled={busyId === user.id} onClick={() => void setApproved(user, true)}>Approve after verification</button></td></tr>)}</tbody></table></div> : <EmptyState title="No pending accounts" detail="New student registrations will appear here." />}
      <h2 className="section-heading">Approved students ({approved.length})</h2>
      {approved.length ? <div className="table-wrap"><table><thead><tr><th>Student</th><th>Registered</th><th>Action</th></tr></thead><tbody>{approved.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><small className="table-sub">{user.email}</small></td><td>{formatDate(user.createdAt)}</td><td><button className="button button-small button-danger" disabled={busyId === user.id} onClick={() => void setApproved(user, false)}>Suspend access</button></td></tr>)}</tbody></table></div> : <EmptyState title="No approved students yet" />}
    </>}
  </>;
}
