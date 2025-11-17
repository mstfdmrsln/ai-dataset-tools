import { Transformer } from "../core/types";
import { TextRecord } from "../nlp/textTypes";

export interface QualityScores {
  overall: number;
  content: number;
  spam: number;
  toxicity: number;
  structure: number;
  readability: number;
}

export interface QualityScorerOptions {
  spamWeight?: number;
  toxicityWeight?: number;
  contentWeight?: number;
  structureWeight?: number;
  readabilityWeight?: number;
  spamLexicon?: string[];
  toxicityLexicon?: string[];
}

const DEFAULT_SPAM = [
  "buy now",
  "click here",
  "limited time",
  "discount",
  "free trial",
  "subscribe",
  "follow me",
  "earn money",
  "make money",
  "visit our website",
  "special offer",
  "sale",
  "deal",
  "bonus",
  "win",
  "winner",
  "promo",
  "promo-code",
  "coupon",
  "free"
];

const DEFAULT_TOXIC = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "idiot",
  "stupid",
  "moron",
  "dumb",
  "loser",
  "hate",
  "kill",
  "die"
];

const STOPWORDS = [
  "the","is","and","a","an","of","to","in","it","that","for","on","with","as",
  "this","by","from","or","be"
];

const EMOJI_REGEX = /[\p{Emoji}\u200d\u2640-\u2642\u2600-\u26FF\u2700-\u27BF]/gu;

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function charEntropy(text: string) {
  const map = new Map<string, number>();
  for (const c of text) map.set(c, (map.get(c) || 0) + 1);
  const len = text.length || 1;
  let h = 0;
  for (const c of map.values()) {
    const p = c / len;
    h -= p * Math.log2(p);
  }
  return h;
}

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export class TextQualityScorer implements Transformer<TextRecord & { quality?: QualityScores }> {
  private weights: Required<Omit<QualityScorerOptions, "spamLexicon" | "toxicityLexicon">>;
  private spamLexicon: string[];
  private toxicityLexicon: string[];

  constructor(opts: QualityScorerOptions = {}) {
    this.weights = {
      spamWeight: opts.spamWeight ?? 0.1,
      toxicityWeight: opts.toxicityWeight ?? 0.1,
      contentWeight: opts.contentWeight ?? 0.35,
      structureWeight: opts.structureWeight ?? 0.2,
      readabilityWeight: opts.readabilityWeight ?? 0.25
    };

    this.spamLexicon = (opts.spamLexicon || []).map(s => s.toLowerCase()).concat(DEFAULT_SPAM);
    this.toxicityLexicon = (opts.toxicityLexicon || []).map(s => s.toLowerCase()).concat(DEFAULT_TOXIC);
  }

  async transform(item: TextRecord & { quality?: QualityScores }) {
    const raw = (item.text || "").trim();
    if (!raw) return null;

    const text = raw;
    const lower = text.toLowerCase();

    const chars = [...text];
    const length = chars.length;

    const words = lower.match(/\b[\p{L}\p{N}']+\b/gu) || [];
    const wordCount = words.length;
    const unique = new Set(words);
    const uniqueRatio = wordCount ? unique.size / wordCount : 0;

    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const sentenceWords = sentences.map(s => (s.match(/\b[\p{L}\p{N}']+\b/gu) || []).length);
    const avgSentenceLength = avg(sentenceWords);

    const letters = chars.filter(c => /\p{L}/u.test(c));
    const upperLetters = letters.filter(c => /[A-Z]/.test(c));
    const digits = chars.filter(c => /\d/.test(c));
    const punctuation = chars.filter(c => /\p{P}/u.test(c));
    const whitespace = chars.filter(c => /\s/u.test(c));
    const emojis = text.match(EMOJI_REGEX) || [];
    const urls = text.match(/\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+/gi) || [];

    let maxRun = 1, run = 1;
    for (let i = 1; i < chars.length; i++) {
      if (chars[i] === chars[i - 1]) {
        run++;
        if (run > maxRun) maxRun = run;
      } else run = 1;
    }

    const entropy = charEntropy(text);
    const entropyNorm = clamp(entropy / Math.log2(96));

    const upperRatio = letters.length ? upperLetters.length / letters.length : 0;
    const punctuationRatio = length ? punctuation.length / length : 0;
    const whitespaceRatio = length ? whitespace.length / length : 0;
    const emojiRatio = length ? emojis.length / length : 0;
    const repeatRatio = length ? maxRun / length : 0;

    const stopHits = words.filter(w => STOPWORDS.includes(w)).length;
    const stopRatio = wordCount ? stopHits / wordCount : 0;

    let contentScore = 1;
    if (length < 20) contentScore *= 0.4;
    else if (length < 50) contentScore *= 0.7;
    if (length > 2000) contentScore *= 0.5;
    if (uniqueRatio < 0.3) contentScore *= 0.6;
    if (uniqueRatio > 0.9) contentScore *= 0.7;
    if (entropyNorm < 0.3 || entropyNorm > 0.95) contentScore *= 0.7;
    contentScore = clamp(contentScore);

    let spamScore = 0;
    for (const word of this.spamLexicon)
      if (lower.includes(word)) spamScore += 0.25;
    if (urls.length > 0) spamScore += clamp(urls.length / 3);
    if (emojiRatio > 0.1) spamScore += 0.2;
    if (upperRatio > 0.6) spamScore += 0.3;
    spamScore = clamp(spamScore);

    let toxicityScore = 0;
    const toxicHits = words.filter(w => this.toxicityLexicon.includes(w)).length;
    if (toxicHits > 0) toxicityScore += clamp(toxicHits / 3);
    if (lower.includes("i hate") || lower.includes("go away")) toxicityScore += 0.2;
    if (upperRatio > 0.7 && lower.includes("you")) toxicityScore += 0.15;
    toxicityScore = clamp(toxicityScore);

    let readabilityScore = 1;
    if (avgSentenceLength === 0) readabilityScore *= 0.4;
    else {
      if (avgSentenceLength < 5) readabilityScore *= 0.6;
      if (avgSentenceLength > 35) readabilityScore *= 0.5;
    }
    if (stopRatio < 0.1 || stopRatio > 0.7) readabilityScore *= 0.7;
    readabilityScore = clamp(readabilityScore);

    let structureScore = 1;
    if (whitespaceRatio > 0.4) structureScore *= 0.6;
    if (punctuationRatio > 0.3) structureScore *= 0.7;
    if (repeatRatio > 0.2) structureScore *= 0.5;
    structureScore = clamp(structureScore);

    const w = this.weights;
    const overall = clamp(
      w.contentWeight * contentScore +
        w.readabilityWeight * readabilityScore +
        w.structureWeight * structureScore +
        w.spamWeight * (1 - spamScore) +
        w.toxicityWeight * (1 - toxicityScore)
    );

    const quality: QualityScores = {
      overall,
      content: contentScore,
      spam: spamScore,
      toxicity: toxicityScore,
      structure: structureScore,
      readability: readabilityScore
    };

    return { ...(item as any), quality };
  }
}
