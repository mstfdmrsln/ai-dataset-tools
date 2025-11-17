import { describe, it, expect } from "vitest";
import { MetadataExtractor } from "./metadataExtractor";

describe("MetadataExtractor", () => {
  it("extracts basic statistics", async () => {
    const extractor = new MetadataExtractor({ detectLanguage: false });

    const out = await extractor.transform({
      text: "Hello world! This is a test."
    } as any);

    expect(out).not.toBeNull();
    const meta = out!.meta;

    expect(meta.charCount).toBeGreaterThan(0);
    expect(meta.wordCount).toBe(6);
    expect(meta.sentenceCount).toBe(2);
    expect(meta.approxTokenCount).toBeGreaterThan(0);
  });

  it("detects urls and domains", async () => {
    const extractor = new MetadataExtractor({ detectLanguage: false });

    const out = await extractor.transform({
      text: "Check https://example.com and www.google.com for more info."
    } as any);

    expect(out).not.toBeNull();
    const meta = out!.meta;

    expect(meta.hasUrl).toBe(true);
    expect(meta.urls.length).toBe(2);
    expect(meta.domains).toContain("example.com");
    expect(meta.domains).toContain("www.google.com");
  });

  it("counts emojis and digits", async () => {
    const extractor = new MetadataExtractor({ detectLanguage: false });

    const out = await extractor.transform({
      text: "Score: 100 🎉🎉"
    } as any);

    expect(out).not.toBeNull();
    const meta = out!.meta;

    expect(meta.digitCount).toBe(3);
    expect(meta.emojiCount).toBeGreaterThan(0);
  });

  it("detects language when enabled", async () => {
    const extractor = new MetadataExtractor({ detectLanguage: true });

    const out = await extractor.transform({
      text: "This is a simple English sentence used for language detection."
    } as any);

    expect(out).not.toBeNull();
    const meta = out!.meta;

    expect(meta.language).toBeDefined();
  });
});
