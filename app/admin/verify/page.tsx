import RequireAuth from "@/components/RequireAuth";
import StudentVerification from "@/components/StudentVerification";

export default function VerifyStudentsPage() {
  return <RequireAuth role="Admin"><div className="container page-space"><StudentVerification /></div></RequireAuth>;
}
