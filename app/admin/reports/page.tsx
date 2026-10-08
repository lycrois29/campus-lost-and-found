import RequireAuth from "@/components/RequireAuth";
import AdminRecords from "@/components/AdminRecords";

export default function AdminReportsPage() {
  return <RequireAuth role="Admin"><div className="container page-space"><AdminRecords kind="reports" /></div></RequireAuth>;
}
