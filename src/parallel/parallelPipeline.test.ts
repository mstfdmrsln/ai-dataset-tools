import { describe, it, expect } from "vitest";

import { SimplePipeline } from "../core/pipeline";
import { ParallelPipeline } from "../parallel/parallelPipeline";

import { TextCleaner } from "../nlp/textCleaner";
import { TextValidator } from "../validation/textValidator";
import { TextDeduper } from "../nlp/textDeduper";

import { TextQualityScorer } from "../quality/qualityScorer";
import { MetadataExtractor } from "../analysis/metadataExtractor";
import { FormatTransformer } from "../format/formatTransformer";

import { TextRecord } from "../nlp/textTypes";

class MockEmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    return Array(5).fill(text.length % 10);
  }
}

describe("Parallel full pipeline", () => {
  it("processes records through all stages in parallel", async () => {
    const embeddingProvider = new MockEmbeddingProvider();

    const pipeline = new SimplePipeline<TextRecord, any>([
      new TextCleaner({
        removeHtml: true,
        lowercase: true,
        removeUrls: true,
        trimSpaces: true
      }),

      new TextValidator({
        minLength: 3,
        maxLength: 2000
      }),

      new TextDeduper("caseInsensitive" as any),

      new TextQualityScorer({
        spamLexicon: ["free money", "win now"],
        toxicityLexicon: ["idiot", "stupid"]
      }),

      new MetadataExtractor(),

      new FormatTransformer({
        mode: "alpaca",
        fields: {
          instruction: "text",
          output: "text"
        }
      })
    ]);

    const parallel = new ParallelPipeline({
      pipeline,
      workers: 4,
      ordered: true
    });

    const input: TextRecord[] = [
      { text: "<p>Hello WORLD!</p>" },
      { text: "Visit https://example.com now" },
      { text: "Hello world!" }, // duplicate of cleaner result → dedupe
      { text: "This is a text about AI models." }
    ];

    const out = await parallel.processArray(input);

    expect(out.filter(Boolean).length).toBe(3); // one deduped

    const rec1 = out[0];
    expect(rec1.instruction).toBe("hello world!");
    expect(rec1.output).toBe("hello world!");

    const recMeta = out[3];
    expect(recMeta).toHaveProperty("instruction");
    expect(recMeta).toHaveProperty("output");
  });
});
