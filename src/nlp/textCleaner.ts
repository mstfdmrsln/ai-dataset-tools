import { Transformer } from '../core/types';
import { TextRecord } from './textTypes';

export interface TextCleanerOptions {
  removeHtml?: boolean;
  removeUrls?: boolean;
  removeMentions?: boolean;
  removeHashtags?: boolean;
  lowercase?: boolean;
  unicodeNormalize?: boolean;
  normalizePunctuation?: boolean;
  collapseSpaces?: boolean;
  removeEmojis?: boolean;
}

const urlRegex = /https?:\/\/\S+/gi;
const htmlTagRegex = /<[^>]*>/g;
const mentionRegex = /@[\w_]+/g;
const hashtagRegex = /#[\w_]+/g;
// basit emoji regex
const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu;

export class TextCleaner implements Transformer<TextRecord> {
  constructor(private opts: TextCleanerOptions = {}) {}

  async transform(item: TextRecord): Promise<TextRecord> {
    let text = item.text ?? '';

    if (this.opts.removeHtml) {
      text = text.replace(htmlTagRegex, ' ');
    }

    if (this.opts.removeUrls) {
      text = text.replace(urlRegex, ' ');
    }

    if (this.opts.removeMentions) {
      text = text.replace(mentionRegex, ' ');
    }

    if (this.opts.removeHashtags) {
      text = text.replace(hashtagRegex, ' ');
    }

    if (this.opts.removeEmojis) {
      text = text.replace(emojiRegex, ' ');
    }

    if (this.opts.unicodeNormalize && text.normalize) {
      text = text.normalize('NFKC');
    }

    if (this.opts.lowercase) {
      text = text.toLowerCase();
    }

    if (this.opts.normalizePunctuation) {
      text = text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    }

    if (this.opts.collapseSpaces !== false) {
      text = text.replace(/\s+/g, ' ').trim();
    }

    return { ...item, text };
  }
}
