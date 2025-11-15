import { describe, it, expect } from 'vitest';
import { JsonlSource } from './jsonlSource';
import fs from 'fs';

describe('JsonlSource', () => {
  it('reads JSONL data', async () => {
    fs.writeFileSync('tmp.jsonl', '{"a":1}\n{"a":2}');
    const src = new JsonlSource('tmp.jsonl');
    const rows = [];
    for await (const x of src.read()) rows.push(x);
    expect(rows.length).toBe(2);
  });
});
