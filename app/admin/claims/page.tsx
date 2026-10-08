import RequireAuth from "@/components/RequireAuth";
import AdminRecords from "@/components/AdminRecords";

export default function AdminClaimsPage() {
  return <RequireAuth role="Admin"><div className="container page-space"><AdminRecords kind="claims" /></div></RequireAuth>;
}
