"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { LoadingState } from "@/components/LoadingState";

export default function RequireAuth({ children, role }: { children: React.ReactNode; role?: "Student" | "Admin" }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState label="Checking your session" />;
  if (!user) return <div className="state-card unauthorized"><div className="empty-icon">⌁</div><h2>Sign in to continue</h2><p>You need a CampusFind account to access this page.</p><Link className="button" href="/login">Log in</Link></div>;
  if (role && user.role !== role) return <div className="state-card unauthorized"><div className="empty-icon">!</div><h2>Admin access required</h2><p>This area is reserved for administrators.</p><Link className="button" href="/dashboard">Back to browse</Link></div>;
  return <>{children}</>;
}
