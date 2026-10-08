import RequireAuth from "@/components/RequireAuth";
import MyClaims from "@/components/MyClaims";

export default function ClaimsPage() { return <RequireAuth><div className="container page-space"><div className="page-heading compact"><div><span className="eyebrow">Your activity</span><h1>My claims</h1><p>Track the review status of items you believe are yours.</p></div></div><MyClaims /></div></RequireAuth>; }
