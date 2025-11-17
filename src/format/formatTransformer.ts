import { Transformer } from "../core/types";
import { TextRecord } from "../nlp/textTypes";

export type FormatMode =
  | "alpaca"
  | "chatml"
  | "openai"
  | "llama3"
  | "qa"
  | "dialog"
  | "classification"
  | "summarization"
  | "translation";

export interface FormattedRecord {
  instruction?: string;
  input?: string;
  output?: string;
  messages?: Array<{ role: string; content: string }>;
  question?: string;
  answer?: string;
  text?: string;
  label?: string;
  document?: string;
  summary?: string;
  source?: string;
  target?: string;
}

export interface FormatOptions {
  mode: FormatMode;
  fields?: {
    instruction?: string;
    input?: string;
    output?: string;
    question?: string;
    answer?: string;
    text?: string;
    label?: string;
    document?: string;
    summary?: string;
    source?: string;
    target?: string;
  };
}

export class FormatTransformer implements Transformer<TextRecord, FormattedRecord> {
  constructor(private opts: FormatOptions) {}

  async transform(rec: TextRecord): Promise<FormattedRecord | null> {
    const f = this.opts.fields || {};

    const get = (k: keyof TextRecord) => rec[k] ?? "";
    const g = (k: keyof typeof f) =>
      f[k] && rec[f[k] as keyof TextRecord]
        ? rec[f[k] as keyof TextRecord]
        : undefined;

    switch (this.opts.mode) {
      case "alpaca":
        return {
          instruction: g("instruction") || get("instruction") || "",
          input: g("input") || get("input") || "",
          output: g("output") || get("output") || rec.text || ""
        };

      case "chatml":
        return {
          messages: [
            { role: "user", content: g("instruction") || get("instruction") || "" },
            { role: "assistant", content: g("output") || get("output") || "" }
          ]
        };

      case "openai":
        return {
          messages: [
            { role: "user", content: g("instruction") || get("instruction") || "" },
            { role: "assistant", content: g("output") || get("output") || "" }
          ]
        };

      case "llama3":
        return {
          messages: [
            { role: "user", content: g("instruction") || get("instruction") || "" },
            { role: "assistant", content: g("output") || get("output") || "" }
          ]
        };

      case "qa":
        return {
          question: g("question") || get("question") || "",
          answer: g("answer") || get("answer") || ""
        };

      case "dialog":
        return {
          messages: [
            { role: "user", content: g("text") || get("text") || "" },
            { role: "assistant", content: g("output") || get("output") || "" }
          ]
        };

      case "classification":
        return {
          text: g("text") || get("text") || "",
          label: g("label") || get("label") || ""
        };

      case "summarization":
        return {
          document: g("document") || get("document") || "",
          summary: g("summary") || get("summary") || ""
        };

      case "translation":
        return {
          source: g("source") || get("source") || "",
          target: g("target") || get("target") || ""
        };
    }

    return null;
  }
}

