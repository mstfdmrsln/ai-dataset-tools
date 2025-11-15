import { describe, it, expect } from 'vitest';
import { TextDeduper, DedupeMode } from './textDeduper';

const dedupeMode = "exact" as DedupeMode;

describe('TextDeduper', () => {
  it('detects exact duplicates', () => {
    const dedupe = new TextDeduper(dedupeMode);
    expect(dedupe.isDuplicate("hello", "hello")).toBe(true);
  });
});
