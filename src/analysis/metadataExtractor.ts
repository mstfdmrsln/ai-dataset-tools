import { Transformer } from "../core/types";
import { TextRecord } from "../nlp/textTypes";
import { franc } from "franc";

export interface TextMetadata {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  approxTokenCount: number;
  language?: string;
  languageScore?: number;
  hasUrl: boolean;
  urls: string[];
  domains: string[];
  emojiCount: number;
  digitCount: number;
  punctuationCount: number;
  whitespaceCount: number;
}

export interface MetadataExtractorOptions {
  detectLanguage?: boolean;
}

const EMOJI_REGEX =
  /[\p{Emoji}\u200d\u2640-\u2642\u2600-\u26FF\u2700-\u27BF]/gu;

export class MetadataExtractor
  implements Transformer<TextRecord & { meta?: TextMetadata }>
{
  private detectLanguage: boolean;

  constructor(options: MetadataExtractorOptions = {}) {
    this.detectLanguage = options.detectLanguage ?? true;
  }

  async transform(
    item: TextRecord & { meta?: TextMetadata }
  ): Promise<(TextRecord & { meta: TextMetadata }) | null> {
    const text = (item.text ?? "").toString();
    const trimmed = text.trim();
    if (!trimmed) return null;

    const chars = Array.from(text);
    const charCount = chars.length;

    const words = trimmed.match(/\b[\p{L}\p{N}']+\b/gu) || [];
    const wordCount = words.length;

    const sentences = trimmed.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const sentenceCount = sentences.length;

    const approxTokenCount = Math.max(1, Math.round(charCount / 4));

    const urls = trimmed.match(/\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+/gi) || [];
    const domains: string[] = [];
    for (const url of urls) {
      try {
        const normalized = url.startsWith("http") ? url : `http://${url}`;
        const u = new URL(normalized);
        domains.push(u.hostname.toLowerCase());
      } catch {
      }
    }

    const emojis = text.match(EMOJI_REGEX) || [];
    const emojiCount = emojis.length;

    const digitCount = (text.match(/\d/g) || []).length;
    const punctuationCount = (text.match(/\p{P}/gu) || []).length;
    const whitespaceCount = (text.match(/\s/g) || []).length;

    let language: string | undefined;
    let languageScore: number | undefined;

    if (this.detectLanguage) {
      const lang = franc(trimmed, { minLength: 10 });
      if (lang !== "und") {
        language = lang;
        languageScore = 1;
      }
    }

    const meta: TextMetadata = {
      charCount,
      wordCount,
      sentenceCount,
      approxTokenCount,
      language,
      languageScore,
      hasUrl: urls.length > 0,
      urls,
      domains,
      emojiCount,
      digitCount,
      punctuationCount,
      whitespaceCount
    };

    return { ...(item as any), meta };
  }
}
