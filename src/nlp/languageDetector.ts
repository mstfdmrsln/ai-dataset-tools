import { franc } from 'franc';
import { TextRecord } from './textTypes';

export interface LanguageDetectionResult {
  lang: string;
  confidence: number;
}

export class LanguageDetector {
  detect(text: string): LanguageDetectionResult | null {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return null;
    const lang = franc(cleaned);
    if (lang === 'und') return null;
    // it is not franc confidence score directly, this is a simple wrapper
    return { lang, confidence: 1 };
  }

  detectRecord(record: TextRecord): LanguageDetectionResult | null {
    return this.detect(record.text ?? '');
  }
}
