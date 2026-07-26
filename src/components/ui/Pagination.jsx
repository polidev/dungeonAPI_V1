export default function Pagination({ page, totalPages, onPrev, onNext, onGoTo }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-2 py-1.5 text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onGoTo(p)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
              p === page
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-muted"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}
