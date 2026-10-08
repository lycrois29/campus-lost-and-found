export type PaginationInfo = { page: number; limit: number; total: number; totalPages: number };

export default function Pagination({ info, onPage }: { info: PaginationInfo; onPage: (page: number) => void }) {
  if (info.totalPages <= 1) return null;
  return <nav className="pagination" aria-label="Results pages">
    <button className="button button-ghost button-small" disabled={info.page <= 1} onClick={() => onPage(info.page - 1)}>Previous</button>
    <span>Page {info.page} of {info.totalPages} · {info.total} results</span>
    <button className="button button-ghost button-small" disabled={info.page >= info.totalPages} onClick={() => onPage(info.page + 1)}>Next</button>
  </nav>;
}
