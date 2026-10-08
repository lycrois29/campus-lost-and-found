"use client";

import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import ItemExplorer from "@/components/ItemExplorer";
import { useAuth } from "@/components/AuthProvider";

function DashboardContent() {
  const { user } = useAuth();
  return <div className="container page-space"><div className="welcome-row"><div><span className="eyebrow">Welcome back</span><h1>{user?.name.split(" ")[0]}, what are you looking for?</h1><p>Browse recent campus reports or share an item with the community.</p></div><Link href="/reports/new" className="button">+ Report item</Link></div><div className="quick-grid"><Link href="/my-reports" className="quick-card"><span>▣</span><strong>My reports</strong><small>Manage your submissions</small></Link><Link href="/claims" className="quick-card"><span>✓</span><strong>My claims</strong><small>Track your claim status</small></Link><Link href="/browse" className="quick-card"><span>⌕</span><strong>Find an item</strong><small>Search every approved report</small></Link></div><section className="section-heading"><div><span className="eyebrow">Latest activity</span><h2>Campus reports</h2></div><Link href="/browse" className="text-link">View all →</Link></section><ItemExplorer /></div>;
}

export default function DashboardPage() { return <RequireAuth><DashboardContent /></RequireAuth>; }
