import { describe, it, expect } from 'vitest';
import { FuzzyTextDeduper, FuzzyDeduperOptions } from './fuzzyDeduper';

describe('FuzzyTextDeduper', () => {
  it('detects near duplicates', () => {
    const f:any = new FuzzyTextDeduper( { threshold: 0.8 } as FuzzyDeduperOptions);
    expect(f.isNearDuplicate("hello world", "helo world")).toBe(true);
  });

  it('rejects non-duplicates', () => {
    const f:any = new FuzzyTextDeduper( { threshold: 1 } as FuzzyDeduperOptions);
    expect(f.isNearDuplicate("hello world", "goodbye world")).toBe(false);
  });
});
