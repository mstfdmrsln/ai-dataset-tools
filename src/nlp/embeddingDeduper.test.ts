import { describe, it, expect } from "vitest";
import { EmbeddingDeduper, EmbeddingProvider } from "./embeddingDeduper";
import { TextRecord } from "./textTypes";

class MockEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    const t = text.toLowerCase();

    const isA =
      t.includes("large language models are powerful tools") ||
      t.includes("large language models are powerful");

    const isB =
      t.includes("large language models are very powerful") ||
      t.includes("tools for ai") ||
      t.includes("artificial intelligence");

    if (isA) return [1, 1, 1, 1, 1];
    if (isB) return [1, 1, 1, 1, 1];

    return [0, 0, 0, 0, 0];
  }
}

describe("EmbeddingDeduper", () => {
  it("filters out highly similar texts", async () => {
    const provider = new MockEmbeddingProvider();
    const deduper = new EmbeddingDeduper({
      provider,
      similarityThreshold: 0.95
    });

    const base: TextRecord = { text: "Large language models are powerful tools." };
    const near: TextRecord = {
      text: "Large language models are very powerful tools for AI."
    };
    const different: TextRecord = {
      text: "Cooking recipes often require fresh ingredients and patience."
    };

    const a = await deduper.transform(base);
    const b = await deduper.transform(near);
    const c = await deduper.transform(different);

    expect(a).not.toBeNull();
    expect(b).toBeNull();
    expect(c).not.toBeNull();
  });

  it("keeps items when below similarity threshold", async () => {
    const provider = new MockEmbeddingProvider();
    const deduper = new EmbeddingDeduper({
      provider,
      similarityThreshold: 0.8
    });

    const t1: TextRecord = { text: "Hello world" };
    const t2: TextRecord = { text: "Completely different content here" };

    const a = await deduper.transform(t1);
    const b = await deduper.transform(t2);

    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
  });

  it("respects maxItems limit", async () => {
    const provider = new MockEmbeddingProvider();
    const deduper = new EmbeddingDeduper({
      provider,
      maxItems: 5
    });

    for (let i = 0; i < 10; i++) {
      await deduper.transform({ text: `sample text ${i}` });
    }

    expect((deduper as any).vectors.length).toBeLessThanOrEqual(5);
  });
});
