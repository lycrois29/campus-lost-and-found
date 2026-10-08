"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function AppHeader() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = user ? [
    { href: "/dashboard", label: "Browse" },
    { href: "/reports/new", label: "Report item" },
    { href: "/my-reports", label: "My reports" },
    { href: "/claims", label: "My claims" },
    ...(user.role === "Admin" ? [{ href: "/admin", label: "Admin" }, { href: "/admin/verify", label: "Verify students" }] : []),
    { href: "/account", label: "Account" },
  ] : [{ href: "/browse", label: "Browse items" }];
  const handleLogout = async () => { await logout(); router.push("/"); };
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">↗</span><span>Campus<span className="brand-accent">Find</span></span>
        </Link>
        <button className="menu-button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
          {nav.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}
          {!loading && !user && <><Link href="/login" className="nav-login">Log in</Link><Link href="/register" className="button button-small">Join CampusFind</Link></>}
          {!loading && user && <><span className="user-chip">{user.name.split(" ")[0]} · {user.role}</span><button className="link-button" onClick={handleLogout}>Log out</button></>}
        </nav>
      </div>
    </header>
  );
}
