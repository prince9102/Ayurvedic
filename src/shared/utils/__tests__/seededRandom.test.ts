import { generateId, normalizeSearch, paginate, pickFrom, seededRandom } from '../seededRandom';

describe('seededRandom utilities', () => {
  it('produces deterministic values for the same seed', () => {
    expect(seededRandom(42)).toBe(seededRandom(42));
    expect(seededRandom(100)).not.toBe(seededRandom(101));
  });

  it('pickFrom selects from array deterministically', () => {
    const items = ['a', 'b', 'c'] as const;
    expect(pickFrom(items, 5)).toBe(pickFrom(items, 5));
  });

  it('generateId creates consistent ids', () => {
    expect(generateId('doc', 0)).toBe('doc-0');
    expect(generateId('prod', 999)).toBe('prod-999');
  });

  it('normalizeSearch trims and lowercases', () => {
    expect(normalizeSearch('  Hello World  ')).toBe('hello world');
  });

  it('paginate returns correct slices', () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const page0 = paginate(items, 0, 20);
    expect(page0.data).toHaveLength(20);
    expect(page0.hasMore).toBe(true);
    expect(page0.total).toBe(50);

    const page2 = paginate(items, 2, 20);
    expect(page2.data).toHaveLength(10);
    expect(page2.hasMore).toBe(false);
  });
});
