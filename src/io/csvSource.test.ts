import { describe, it, expect } from 'vitest';
import { CsvSource } from './csvSource';
import fs from 'fs';

describe('CsvSource', () => {
  it('reads CSV rows', async () => {
    fs.writeFileSync('tmp.csv', 'a,b\n1,2');
    const src = new CsvSource('tmp.csv');
    const rows = [];
    for await (const x of src.read()) rows.push(x);
    expect(rows.length).toBe(1);
  });
});
