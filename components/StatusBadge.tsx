import type { ClaimStatus, ItemStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: ItemStatus | ClaimStatus }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}
