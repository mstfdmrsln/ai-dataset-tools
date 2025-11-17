import { describe, it, expect } from "vitest";
import { FormatTransformer } from "./formatTransformer";
import { TextRecord } from "../nlp/textTypes";

const base: TextRecord = {
  text: "Hello world",
  instruction: "Write a poem",
  input: "About the sea",
  output: "Waves crash softly",
  question: "What is 2+2?",
  answer: "4",
  label: "positive",
  summary: "Short summary",
  document: "This is a long document",
  source: "bonjour",
  target: "hello"
};

describe("FormatTransformer", () => {
  it("formats alpaca", async () => {
    const t = new FormatTransformer({ mode: "alpaca" });
    const out = await t.transform(base);
    expect(out?.instruction).toBe("Write a poem");
    expect(out?.input).toBe("About the sea");
    expect(out?.output).toBe("Waves crash softly");
  });

  it("formats chatml", async () => {
    const t = new FormatTransformer({ mode: "chatml" });
    const out = await t.transform(base);
    expect(out?.messages?.[0].role).toBe("user");
    expect(out?.messages?.[1].role).toBe("assistant");
  });

  it("formats openai", async () => {
    const t = new FormatTransformer({ mode: "openai" });
    const out = await t.transform(base);
    expect(out?.messages?.length).toBe(2);
  });

  it("formats llama3", async () => {
    const t = new FormatTransformer({ mode: "llama3" });
    const out = await t.transform(base);
    expect(out?.messages?.[0].content).toBe("Write a poem");
  });

  it("formats qa", async () => {
    const t = new FormatTransformer({ mode: "qa" });
    const out = await t.transform(base);
    expect(out?.question).toBe("What is 2+2?");
    expect(out?.answer).toBe("4");
  });

  it("formats dialog", async () => {
    const t = new FormatTransformer({ mode: "dialog" });
    const out = await t.transform(base);
    expect(out?.messages?.[0].role).toBe("user");
  });

  it("formats classification", async () => {
    const t = new FormatTransformer({ mode: "classification" });
    const out = await t.transform(base);
    expect(out?.text).toBe("Hello world");
    expect(out?.label).toBe("positive");
  });

  it("formats summarization", async () => {
    const t = new FormatTransformer({ mode: "summarization" });
    const out = await t.transform(base);
    expect(out?.document).toBe("This is a long document");
    expect(out?.summary).toBe("Short summary");
  });

  it("formats translation", async () => {
    const t = new FormatTransformer({ mode: "translation" });
    const out = await t.transform(base);
    expect(out?.source).toBe("bonjour");
    expect(out?.target).toBe("hello");
  });

  it("remaps fields using fields option", async () => {
    const rec: TextRecord = {
      text: "ignored",
      foo: "User question here",
      bar: "Assistant answer here"
    } as any;

    const t = new FormatTransformer({
      mode: "qa",
      fields: {
        question: "foo",
        answer: "bar"
      }
    });

    const out = await t.transform(rec);
    expect(out?.question).toBe("User question here");
    expect(out?.answer).toBe("Assistant answer here");
  });
});
