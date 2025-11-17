import { Transformer } from "../core/types";
import { TextRecord } from "../nlp/textTypes";

export interface TextValidatorOptions {
  minLength?: number;
  maxLength?: number;
  minWords?: number;
  maxWords?: number;
  rejectOnlyEmoji?: boolean;
  rejectOnlyPunctuation?: boolean;
  rejectGibberish?: boolean;
  rejectKeyboardMashing?: boolean;
  rejectBase64?: boolean;
  rejectHashLike?: boolean;
  maxPunctuationRatio?: number;
  maxWhitespaceRatio?: number;
}

export class TextValidator implements Transformer<TextRecord> {
  constructor(private opts: TextValidatorOptions = {}) {}

  async transform(item: TextRecord): Promise<TextRecord | null> {
    const text = (item.text ?? "").trim();
    if (!text) return null;

    const words = text.split(/\s+/);

    if (this.opts.minLength && text.length < this.opts.minLength) return null;
    if (this.opts.maxLength && text.length > this.opts.maxLength) return null;

    if (this.opts.minWords && words.length < this.opts.minWords) return null;
    if (this.opts.maxWords && words.length > this.opts.maxWords) return null;

    if (this.opts.rejectOnlyEmoji && /^[\p{Emoji}\s]+$/u.test(text)) return null;
    if (this.opts.rejectOnlyPunctuation && /^[\p{P}\s]+$/u.test(text)) return null;

    if (this.opts.rejectGibberish) {
      if (/(.)\1{4,}/.test(text)) return null;
      const vowels = text.match(/[aeiou]/gi)?.length ?? 0;
      const vowelRatio = vowels / text.length;
      if (text.length >= 12 && vowelRatio < 0.2) return null;
    }

    if (this.opts.rejectKeyboardMashing) {
      if (/(asdf|qwer|zxcv|asdfgh|qwerty|asdfasdf)/i.test(text)) return null;
    }

    if (this.opts.rejectBase64) {
      const isBase64 =
        /^[A-Za-z0-9+/]+={0,2}$/.test(text) &&
        text.length % 4 === 0;
      if (isBase64) return null;
    }

    if (this.opts.rejectHashLike && /^[a-f0-9]{16,}$/i.test(text)) return null;

    if (this.opts.maxPunctuationRatio) {
      const p = (text.match(/\p{P}/gu) || []).length;
      if (p / text.length > this.opts.maxPunctuationRatio) return null;
    }

    if (this.opts.maxWhitespaceRatio) {
      const w = (text.match(/\s/g) || []).length;
      if (w / text.length > this.opts.maxWhitespaceRatio) return null;
    }

    return item;
  }
}
