import { Transformer } from "../core/types";
import { TextRecord } from "./textTypes";

export interface TextCleanerOptions {
  removeHtml?: boolean;
  removeUrls?: boolean;
  removeMentions?: boolean;
  removeHashtags?: boolean;
  removeEmojis?: boolean;
  stripMarkdown?: boolean;
  unicodeNormalize?: boolean;
  normalizePunctuation?: boolean;
  removeAIContentBoilerplate?: boolean;
  trimSpaces?: boolean;

  maskEmails?: boolean;
  maskPhones?: boolean;
  maskIpAddresses?: boolean;

  removeProfanity?: boolean;
  profanityList?: string[];
  profanityMask?: string;

  lowercase?: boolean;
  collapseSpaces?: boolean;

  minLength?: number;
  maxLength?: number;
}

const EMAIL_REGEX =
  /\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+\b/g;

const PHONE_REGEX =
  /(?:\+?\d[\d\s\-()]{5,}\d)/g;

const IPV4_REGEX =
  /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g;

const IPV6_REGEX =
  /\b(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}\b|\b(?:[A-F0-9]{1,4}:){1,7}:|\b:(?::[A-F0-9]{1,4}){1,7}\b|\b(?:[A-F0-9]{1,4}:){1,6}:[A-F0-9]{1,4}\b/gi;

const EMOJI_REGEX =
  /[\p{Emoji}\u200d\u2640-\u2642\u2600-\u26FF\u2700-\u27BF]/gu;

export class TextCleaner implements Transformer<TextRecord> {
  constructor(private opts: TextCleanerOptions = {}) {}

  async transform(item: TextRecord): Promise<TextRecord | null> {
    let text = item.text ?? "";
    if (!text.trim()) return null;

    if (this.opts.removeHtml) {
      text = text.replace(/<\/?[^>]+(>|$)/g, " ");
    }

    if (this.opts.removeUrls) {
      text = text.replace(/\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+/gi, " ");
    }

    if (this.opts.removeMentions) {
      text = text.replace(/@\w+/g, " ");
    }

    if (this.opts.removeHashtags) {
      text = text.replace(/#\w+/g, " ");
    }

    if (this.opts.removeEmojis) {
      const before = text;
      text = text.replace(EMOJI_REGEX, " ");
      if (before !== text && !this.opts.collapseSpaces) {
        text = text.replace(/\s+/g, " ");
      }
    }

    if (this.opts.stripMarkdown) {
      text = text
        .replace(/[_*~`>#+=-]/g, " ")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1");
    }

    if (this.opts.removeAIContentBoilerplate) {
      text = text.replace(/\bAs an AI language model,\s*/gi, "");
      text = text.replace(/\bAs a language model,\s*/gi, "");
    }

    if (this.opts.unicodeNormalize) {
      text = text.normalize("NFKC");
    }

    if (this.opts.maskIpAddresses) {
      text = text.replace(IPV6_REGEX, "[IP]");
      text = text.replace(IPV4_REGEX, "[IP]");
    }

    if (this.opts.maskEmails) {
      text = text.replace(EMAIL_REGEX, "[EMAIL]");
    }

    if (this.opts.maskPhones) {
      text = text.replace(PHONE_REGEX, "[PHONE]");
    }

    if (this.opts.removeProfanity && this.opts.profanityList) {
      const mask = this.opts.profanityMask || "***";
      for (const word of this.opts.profanityList) {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        text = text.replace(regex, mask);
      }
    }

    if (this.opts.normalizePunctuation) {
      text = text.replace(/\.{3,}/g, "…");
      text = text.replace(/!{2,}/g, "!!");
      text = text.replace(/\?{2,}/g, "??");
      text = text.replace(/(\?|\!){3,}/g, "??!!");
    }

    if (this.opts.lowercase) {
      text = text.toLowerCase();
    }

    if (this.opts.collapseSpaces) {
      text = text.replace(/\s+/g, " ").trim();
    }

    if (this.opts.minLength && text.length < this.opts.minLength) {
      return null;
    }

    if (this.opts.maxLength && text.length > this.opts.maxLength) {
      return null;
    }

    if (this.opts.trimSpaces == true) {
      if(!text.trim()) return null;
      text = text.trim();
    }

    return { text };
  }
}
