import { Transformer } from '../core/types';
import { TextRecord } from './textTypes';

function normalizeKey(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

export type DedupeMode = 'exact' | 'normalized';

export class TextDeduper implements Transformer<TextRecord> {
  private seen = new Set<string>();

  constructor(private mode: DedupeMode = 'exact') {}

  async transform(item: TextRecord): Promise<TextRecord | null> {
    const raw = item.text ?? '';
    if (!raw.trim()) return null;

    const key = this.mode === 'exact' ? raw : normalizeKey(raw);

    if (this.seen.has(key)) {
      return null;
    }
    this.seen.add(key);
    return item;
  }

  isDuplicate(text1: string, text2: string): boolean {
    const key1 = this.mode === 'exact' ? text1 : normalizeKey(text1);
    const key2 = this.mode === 'exact' ? text2 : normalizeKey(text2);
    return key1 === key2;
  }
}
