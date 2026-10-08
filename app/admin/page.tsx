import RequireAuth from "@/components/RequireAuth";
import AdminDashboard from "@/components/AdminDashboard";
import Link from "next/link";

export default function AdminPage() { return <RequireAuth role="Admin"><div className="container page-space"><div className="admin-shortcuts"><Link className="button button-ghost button-small" href="/admin/reports">All reports</Link><Link className="button button-ghost button-small" href="/admin/claims">All claims</Link><Link className="button button-ghost button-small" href="/admin/verify">Verify students</Link></div><AdminDashboard /></div></RequireAuth>; }
