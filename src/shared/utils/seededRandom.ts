/** Deterministic pseudo-random from seed — O(1), no storage needed for 20k+ items */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export function pickFrom<T>(arr: readonly T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)]!;
}

export function generateId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): { data: T[]; total: number; page: number; pageSize: number; hasMore: boolean } {
  const start = page * pageSize;
  const data = items.slice(start, start + pageSize);
  return {
    data,
    total: items.length,
    page,
    pageSize,
    hasMore: start + pageSize < items.length,
  };
}

export function normalizeSearch(query: string): string {
  return query.trim().toLowerCase();
}
