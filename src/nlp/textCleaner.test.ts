import { describe, it, expect } from 'vitest';
import { TextCleaner } from './textCleaner';
import { TextRecord } from './textTypes';

const sampleInput: TextRecord = { text: "<p>Hello WORLD</p> visit https://example.com" };

describe('TextCleaner', async() => {
  it('cleans html and urls', async () => {
    const cleaner = new TextCleaner({ removeHtml: true, removeUrls: true, lowercase: true });
    const out = await cleaner.transform(sampleInput);
    expect(out?.text).toBe("hello world visit");
  });
});
