import Link from "next/link";
import ItemExplorer from "@/components/ItemExplorer";

export default function BrowsePage() {
  return <div className="container page-space"><div className="page-heading"><div><span className="eyebrow">Community board</span><h1>Browse items</h1><p>Search approved lost and found reports from around campus.</p></div><Link href="/reports/new" className="button">Report an item</Link></div><ItemExplorer /></div>;
}
