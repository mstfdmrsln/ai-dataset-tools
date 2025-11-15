import { describe, it, expect } from 'vitest';
import { computeTextStats } from './textStats';

describe('TextStats', () => {
  it('computes basic stats', () => {
    const stats = computeTextStats([{ text: 'hello world' }]);
    expect(stats.count).toBe(1);
  });
});
