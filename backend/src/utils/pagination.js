// Pagination helpers for list endpoints. Establishes the convention reused by
// every paginated resource: 1-based `page`, `perPage` defaulting to 20 and
// clamped to 100, surfaced in the response envelope's `meta`.
export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 100;

export function parsePagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const requested = Number.parseInt(query.perPage, 10) || DEFAULT_PER_PAGE;
  const perPage = Math.min(Math.max(1, requested), MAX_PER_PAGE);
  return { page, perPage, limit: perPage, offset: (page - 1) * perPage };
}

export function buildMeta(page, perPage, total) {
  return { page, perPage, total };
}
