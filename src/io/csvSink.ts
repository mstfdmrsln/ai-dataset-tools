import fs from 'node:fs';
import Papa from 'papaparse';
import { DataSink } from '../core/types';

export class CsvSink<T = any> implements DataSink<T> {
  private rows: T[] = [];
  constructor(private filePath: string) {}

  async write(item: T): Promise<void> {
    this.rows.push(item);
  }

  async close(): Promise<void> {
    const csv = Papa.unparse(this.rows as any);
    fs.writeFileSync(this.filePath, csv, 'utf8');
  }
}
