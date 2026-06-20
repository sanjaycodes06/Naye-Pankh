import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  // Visible page numbers (max 5 shown)
  const getPages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }

    if (range[0] > 1) {
      rangeWithDots.push(1);
      if (range[0] > 2) rangeWithDots.push("...");
    }
    rangeWithDots.push(...range);
    if (range[range.length - 1] < pages) {
      if (range[range.length - 1] < pages - 1) rangeWithDots.push("...");
      rangeWithDots.push(pages);
    }
    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-ink-400">
        Showing <span className="font-medium text-ink-700">{start}–{end}</span> of{" "}
        <span className="font-medium text-ink-700">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-ink-300 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                p === page
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-ink-600 hover:bg-ink-100"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
