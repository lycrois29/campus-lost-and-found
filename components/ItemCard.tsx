import Link from "next/link";
import type { Item } from "@/lib/types";
import { formatDate } from "@/lib/client";
import StatusBadge from "@/components/StatusBadge";

export default function ItemCard({ item, admin = false }: { item: Item; admin?: boolean }) {
  return <article className="item-card">
    {item.imageUrl ? <img src={item.imageUrl} alt="" referrerPolicy="no-referrer" className="item-image" /> : <div className={`item-image placeholder ${item.type.toLowerCase()}`}><span>{item.type === "Lost" ? "?" : "✓"}</span></div>}
    <div className="item-card-body">
      <div className="item-card-top"><span className={`type-label ${item.type.toLowerCase()}`}>{item.type}</span>{admin && <StatusBadge status={item.status} />}</div>
      <h3><Link href={`/items/${item.id}`}>{item.title}</Link></h3>
      <p className="item-meta">{item.category?.name ?? "Uncategorised"} · {item.location}</p>
      <p className="item-description">{item.description}</p>
      <div className="item-footer"><span>{formatDate(item.dateOccurred)}</span><Link href={`/items/${item.id}`} className="text-link">View details →</Link></div>
    </div>
  </article>;
}
