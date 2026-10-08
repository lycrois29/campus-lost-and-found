import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import ReportForm from "@/components/ReportForm";

export default function NewReportPage() { return <RequireAuth><div className="container narrow page-space"><Link href="/dashboard" className="back-link">← Back to browse</Link><div className="page-heading compact"><div><span className="eyebrow">Share with campus</span><h1>Report an item</h1><p>Give people enough detail to recognise and return it.</p></div></div><ReportForm /><div className="helper-note"><strong>What happens next?</strong><span>Student reports are reviewed by an admin before appearing publicly.</span></div></div></RequireAuth>; }
