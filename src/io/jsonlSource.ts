import fs from 'node:fs';
import readline from 'node:readline';
import { DataSource } from '../core/types';

export class JsonlSource<T = any> implements DataSource<T> {
  constructor(private filePath: string) {}

  async *read(): AsyncIterable<T> {
    const stream = fs.createReadStream(this.filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        yield JSON.parse(trimmed) as T;
      } catch {
        continue;
      }
    }
  }
}
