import { describe, it, expect } from "vitest";
import { TextQualityScorer } from "./qualityScorer";

describe("TextQualityScorer", () => {
  it("assigns higher score to high-quality text than spammy text", async () => {
    const scorer = new TextQualityScorer();

    const highQuality = await scorer.transform({
      text:
        "Large language models are trained on vast amounts of text data. " +
        "They can generate coherent and context-aware responses, " +
        "and are widely used in modern AI applications such as chatbots and summarization."
    } as any);

    const spammy = await scorer.transform({
      text:
        "BUY NOW!!! CLICK HERE for FREE discount!!! Visit our website http://spam.example.com " +
        "LIMITED TIME OFFER!!!"
    } as any);

    expect(highQuality).not.toBeNull();
    expect(spammy).not.toBeNull();

    const h = highQuality!.quality;
    const s = spammy!.quality;

    expect(h.overall).toBeGreaterThan(s.overall);
    expect(s.spam).toBeGreaterThan(0.6);
  });

  it("detects toxicity and lowers overall score", async () => {
    const scorer = new TextQualityScorer();

    const neutral = await scorer.transform({
      text: "I disagree with this idea, but I understand the reasoning."
    } as any);

    const toxic = await scorer.transform({
      text: "You are such an idiot, this is the dumbest thing ever, I hate you."
    } as any);

    expect(neutral).not.toBeNull();
    expect(toxic).not.toBeNull();

    const n = neutral!.quality;
    const t = toxic!.quality;

    expect(t.toxicity).toBeGreaterThan(0.5);
    expect(t.overall).toBeLessThan(n.overall);
  });

  it("adds quality scores field to record", async () => {
    const scorer = new TextQualityScorer();

    const out = await scorer.transform({
      text: "This is a simple sentence with reasonable length and structure."
    } as any);

    expect(out).not.toBeNull();
    expect(out!.quality).toBeDefined();
    expect(out!.quality.overall).toBeGreaterThan(0);
    expect(out!.quality.overall).toBeLessThanOrEqual(1);
  });
});
