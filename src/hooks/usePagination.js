import { useState, useCallback } from "react";

export function usePagination(initial = {}) {
  const [page, setPage] = useState(initial.page || 1);
  const [limit] = useState(initial.limit || 10);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goToPage = useCallback((p) => setPage(Math.max(1, p)), []);
  const reset = useCallback(() => setPage(1), []);

  return { page, limit, nextPage, prevPage, goToPage, reset };
}
