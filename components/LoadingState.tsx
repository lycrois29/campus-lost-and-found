export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <div className="state-card"><span className="spinner" /> <span>{label}…</span></div>;
}

export function EmptyState({ title, detail, action }: { title: string; detail?: string; action?: React.ReactNode }) {
  return <div className="state-card empty-state"><div className="empty-icon">⌁</div><h3>{title}</h3>{detail && <p>{detail}</p>}{action}</div>;
}
