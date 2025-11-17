import { Transformer } from "../core/types";
import { TextRecord } from "./textTypes";

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export interface EmbeddingDeduperOptions {
  provider: EmbeddingProvider;
  similarityThreshold?: number;
  maxItems?: number;
  sampleLimit?: number;
  normalizeText?: boolean;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export class EmbeddingDeduper implements Transformer<TextRecord> {
  private vectors: number[][] = [];
  private texts: string[] = [];
  private threshold: number;
  private maxItems: number;
  private sampleLimit: number;
  private normalizeText: boolean;
  private provider: EmbeddingProvider;

  constructor(options: EmbeddingDeduperOptions) {
    this.provider = options.provider;
    this.threshold = options.similarityThreshold ?? 0.9;
    this.maxItems = options.maxItems ?? 50000;
    this.sampleLimit = options.sampleLimit ?? 1024;
    this.normalizeText = options.normalizeText ?? true;
  }

  private normalize(input: string): string {
    if (!this.normalizeText) return input;
    return input.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
  }

  private pickIndices(count: number): number[] {
    const n = this.vectors.length;
    const limit = Math.min(count, n);
    if (n === 0 || limit === 0) return [];
    if (limit === n) return Array.from({ length: n }, (_, i) => i);
    const idx = new Set<number>();
    while (idx.size < limit) {
      idx.add(Math.floor(Math.random() * n));
    }
    return Array.from(idx);
  }

  async transform(item: TextRecord): Promise<TextRecord | null> {
    const raw = item.text ?? "";
    const text = this.normalize(raw);
    if (!text) return null;

    const embedding = await this.provider.embed(text);
    const indices = this.pickIndices(this.sampleLimit);

    for (const i of indices) {
      const existing = this.vectors[i];
      const sim = cosineSimilarity(existing, embedding);
      if (sim >= this.threshold) {
        return null;
      }
    }

    if (this.vectors.length >= this.maxItems) {
      this.vectors.shift();
      this.texts.shift();
    }

    this.vectors.push(embedding);
    this.texts.push(text);

    return item;
  }
}
