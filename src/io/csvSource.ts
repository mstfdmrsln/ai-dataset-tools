import fs from 'node:fs';
import Papa from 'papaparse';
import { DataSource } from '../core/types';

export class CsvSource<T = any> implements DataSource<T> {
  constructor(private filePath: string) {}

  async *read(): AsyncIterable<T> {
    const file = fs.readFileSync(this.filePath, 'utf8');
    const result = Papa.parse<T>(file, { header: true, skipEmptyLines: true });
    for (const row of result.data) {
      yield row;
    }
  }
}
