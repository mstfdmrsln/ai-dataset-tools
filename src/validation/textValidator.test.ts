import { describe, it, expect } from "vitest";
import { TextValidator } from "./textValidator";

describe("TextValidator", () => {
  it("filters by min/max length", async () => {
    const v = new TextValidator({ minLength: 5, maxLength: 10 });

    expect(await v.transform({ text: "hey" })).toBeNull();
    expect(await v.transform({ text: "this is too long text" })).toBeNull();
    expect(await v.transform({ text: "hello!" })).not.toBeNull();
  });

  it("filters by min/max words", async () => {
    const v = new TextValidator({ minWords: 2, maxWords: 4 });

    expect(await v.transform({ text: "hello" })).toBeNull();
    expect(await v.transform({ text: "one two three four five" })).toBeNull();
    expect(await v.transform({ text: "hello world" })).not.toBeNull();
  });

  it("rejects emoji-only", async () => {
    const v = new TextValidator({ rejectOnlyEmoji: true });
    expect(await v.transform({ text: "🔥🔥🔥" })).toBeNull();
  });

  it("rejects punctuation-only", async () => {
    const v = new TextValidator({ rejectOnlyPunctuation: true });
    expect(await v.transform({ text: "!!!??..." })).toBeNull();
  });

  it("detects gibberish", async () => {
    const v = new TextValidator({ rejectGibberish: true });

    expect(await v.transform({ text: "aaaaaaaaaaaaaaa" })).toBeNull();
    expect(await v.transform({ text: "asdjklasjdlkasjd" })).toBeNull();
  });

  it("detects keyboard mashing", async () => {
    const v = new TextValidator({ rejectKeyboardMashing: true });
    expect(await v.transform({ text: "asdfasdfasdf" })).toBeNull();
  });

  it("detects base64", async () => {
    const v = new TextValidator({ rejectBase64: true });
    expect(await v.transform({ text: "aGVsbG8gd29ybGQ=" })).toBeNull();
  });

  it("detects hash-like strings", async () => {
    const v = new TextValidator({ rejectHashLike: true });
    expect(await v.transform({ text: "a7f9c3b1d8e4f6a1" })).toBeNull();
  });

  it("rejects high punctuation ratio", async () => {
    const v = new TextValidator({ maxPunctuationRatio: 0.3 });
    expect(await v.transform({ text: "!!!!????.....hello" })).toBeNull();
  });

  it("rejects high whitespace ratio", async () => {
    const v = new TextValidator({ maxWhitespaceRatio: 0.5 });
    expect(await v.transform({ text: "hello              world" })).toBeNull();
  });
});
