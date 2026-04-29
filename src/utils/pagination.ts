/**
 * pagination.ts
 * Transforms the backend's Spring Boot pagination format
 * into the format the app uses everywhere.
 *
 * Backend (Spring Boot Page object):
 *   { content: [], totalElements: N, totalPages: N, number: N }
 *
 * App format:
 *   { items: [], total: N, pages: N, currentPage: N }
 */
export const transformPage = <T = any>(response: any) => ({
  items: (response?.content ?? response?.items ?? []) as T[],
  total: response?.totalElements ?? response?.total ?? 0,
  pages: response?.totalPages ?? response?.pages ?? 1,
  currentPage: response?.number ?? response?.currentPage ?? response?.page ?? 0,
  page: response?.number ?? response?.currentPage ?? response?.page ?? 0,
  size: response?.size ?? ((response?.content ?? response?.items ?? []) as T[]).length,
  totalPages: response?.totalPages ?? response?.pages ?? 1,
  hasMore: response?.last === false
    ? true
    : response?.hasMore ?? ((response?.number ?? response?.page ?? 0) + 1 < (response?.totalPages ?? response?.pages ?? 1)),
});
