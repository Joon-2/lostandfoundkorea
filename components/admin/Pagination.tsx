"use client";

// Shared pagination footer for admin tables. Used by CaseList,
// DeliveriesView, LeadsView. Renders only when there's more than one
// page so single-page lists stay clean.
//
// Layout: "Showing X–Y of Z" + optional page-size select on the left,
// numbered buttons with ellipses on the right.

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1 && !onPageSizeChange) return null;

  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(total, safePage * pageSize);
  const range = getPageRange(safePage, pageCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-alt px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-3 text-muted">
        <span>
          Showing {start}–{end} of {total}
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5 text-xs">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>per page</span>
          </label>
        )}
      </div>

      {pageCount > 1 && (
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center gap-1"
        >
          <NavButton
            label="← Prev"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage <= 1}
          />
          {range.map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                aria-hidden="true"
                className="px-2 text-xs text-muted"
              >
                …
              </span>
            ) : (
              <PageButton
                key={p}
                page={p}
                active={p === safePage}
                onClick={() => onPageChange(p)}
              />
            )
          )}
          <NavButton
            label="Next →"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= pageCount}
          />
        </nav>
      )}
    </div>
  );
}

function NavButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-alt disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function PageButton({
  page,
  active,
  onClick,
}: {
  page: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`min-w-[32px] rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-accent bg-accent text-white shadow-sm"
          : "border-border bg-card text-foreground hover:bg-alt"
      }`}
    >
      {page}
    </button>
  );
}

// Returns up to ~7 entries: first/last always visible, current with
// neighbors, ellipses where there are gaps.
function getPageRange(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  if (page <= 4) return [1, 2, 3, 4, 5, "…", pageCount];
  if (page >= pageCount - 3) {
    return [
      1,
      "…",
      pageCount - 4,
      pageCount - 3,
      pageCount - 2,
      pageCount - 1,
      pageCount,
    ];
  }
  return [1, "…", page - 1, page, page + 1, "…", pageCount];
}
