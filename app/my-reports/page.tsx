import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import MyReports from "@/components/MyReports";

export default function MyReportsPage() { return <RequireAuth><div className="container page-space"><div className="page-heading"><div><span className="eyebrow">Your activity</span><h1>My reports</h1><p>Keep track of the lost and found reports you have submitted.</p></div><Link href="/reports/new" className="button">+ Report item</Link></div><MyReports /></div></RequireAuth>; }
