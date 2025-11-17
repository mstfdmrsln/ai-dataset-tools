import { describe, it, expect } from "vitest";
import { TextCleaner } from "./textCleaner";
import { TextRecord } from "./textTypes";

describe("TextCleaner", () => {
  it("removes HTML tags and URLs", async () => {
    const cleaner = new TextCleaner({
      removeHtml: true,
      removeUrls: true,
      lowercase: true,
      collapseSpaces: true
    });

    const input: TextRecord = { text: "<p>Hello WORLD</p> visit https://example.com" };
    const out = await cleaner.transform(input);

    expect(out?.text).toBe("hello world visit");
  });

  it("removes mentions and hashtags", async () => {
    const cleaner = new TextCleaner({
      removeMentions: true,
      removeHashtags: true,
      collapseSpaces: true
    });

    const input: TextRecord = { text: "Hello @user this is #awesome" };
    const out = await cleaner.transform(input);

    expect(out?.text).toBe("Hello this is");
  });

  it("removes emojis", async () => {
    const cleaner = new TextCleaner({ removeEmojis: true });

    const input: TextRecord = { text: "Hello 🌍🔥" };
    const out = await cleaner.transform(input);

    expect(out?.text).toBe("Hello ");
  });

  it("normalizes Unicode and lowercase", async () => {
    const cleaner = new TextCleaner({
      unicodeNormalize: true,
      lowercase: true
    });

    const input: TextRecord = { text: "İSTANBUL" };
    const out = await cleaner.transform(input);

    expect(out?.text).toBe("i̇stanbul".normalize("NFKC"));
  });

  it("strips markdown syntax", async () => {
    const cleaner = new TextCleaner({
      stripMarkdown: true,
      collapseSpaces: true
    });

    const input: TextRecord = {
      text: "# Title\n**Bold Text** and `code` [link](https://example.com)"
    };

    const out = await cleaner.transform(input);

    expect(out?.text).toBe("Title Bold Text and code link");
  });

  it("removes common AI boilerplate", async () => {
    const cleaner = new TextCleaner({
      removeAIContentBoilerplate: true,
      collapseSpaces: true
    });

    const input: TextRecord = {
      text: "As an AI language model, I cannot browse the internet."
    };

    const out = await cleaner.transform(input);

    expect(out?.text).toBe("I cannot browse the internet.");
  });

  it("masks emails, phones and IPs", async () => {
    const cleaner = new TextCleaner({
      maskEmails: true,
      maskPhones: true,
      maskIpAddresses: true,
      collapseSpaces: true
    });

    const input: TextRecord = {
      text: "Contact me at test@example.com or +1 555-123-4567 or visit 192.168.0.1"
    };

    const out = await cleaner.transform(input);

    expect(out?.text).toBe("Contact me at [EMAIL] or [PHONE] or visit [IP]");
  });

  it("applies profanity filter with mask", async () => {
    const cleaner = new TextCleaner({
      removeProfanity: true,
      profanityList: ["badword", "ugly"],
      profanityMask: "[CENSORED]"
    });

    const input: TextRecord = { text: "This is a badword and very ugly" };
    const out = await cleaner.transform(input);

    expect(out?.text).toBe("This is a [CENSORED] and very [CENSORED]");
  });

  it("filters by minLength", async () => {
    const cleaner = new TextCleaner({
      minLength: 10
    });

    const out = await cleaner.transform({ text: "short" });

    expect(out).toBeNull();
  });

  it("filters by maxLength", async () => {
    const cleaner = new TextCleaner({
      maxLength: 5
    });

    const out = await cleaner.transform({ text: "this is too long" });

    expect(out).toBeNull();
  });

  it("normalizes punctuation", async () => {
    const cleaner = new TextCleaner({
      normalizePunctuation: true
    });

    const out = await cleaner.transform({
      text: "What???!!! No....."
    });

    expect(out?.text).toBe("What??!! No…");
  });

  it("collapses spaces", async () => {
    const cleaner = new TextCleaner({
      collapseSpaces: true
    });

    const out = await cleaner.transform({
      text: "Hello     world   !"
    });

    expect(out?.text).toBe("Hello world !");
  });

  it("returns null when output is empty", async () => {
    const cleaner = new TextCleaner({
      removeHtml: true,
      removeUrls: true,
      trimSpaces: true
    });

    const out = await cleaner.transform({
      text: "<p></p>     https://example.com"
    });

    expect(out).toBeNull();
  });
});
