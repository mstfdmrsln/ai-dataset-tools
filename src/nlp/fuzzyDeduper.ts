import { Transformer } from '../core/types';
import { TextRecord } from './textTypes';

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - dist / maxLen;
}

export interface FuzzyDeduperOptions {
  threshold?: number; // 0-1
  sampleLimit?: number; // compare up to N previous samples
}

export class FuzzyTextDeduper implements Transformer<TextRecord> {
  private seen: string[] = [];
  private threshold: number;
  private sampleLimit: number;

  constructor(opts: FuzzyDeduperOptions = {}) {
    this.threshold = opts.threshold ?? 0.9;
    this.sampleLimit = opts.sampleLimit ?? 2000;
  }

  async transform(item: TextRecord): Promise<TextRecord | null> {
    const text = (item.text ?? '').trim();
    if (!text) return null;

    const normalized = text.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ');

    const compareCount = Math.min(this.sampleLimit, this.seen.length);
    for (let i = 0; i < compareCount; i++) {
      const score = similarity(normalized, this.seen[i]);
      if (score >= this.threshold) {
        return null;
      }
    }

    this.seen.push(normalized);
    return item;
  }

  isNearDuplicate(a: string, b: string): boolean {
    const na = a.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ');
    const nb = b.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ');
    const score = similarity(na, nb);
    return score >= this.threshold;
  }

}
