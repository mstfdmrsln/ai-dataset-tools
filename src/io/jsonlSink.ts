import fs from 'node:fs';
import { DataSink } from '../core/types';

export class JsonlSink<T = any> implements DataSink<T> {
  private stream: fs.WriteStream;

  constructor(filePath: string) {
    this.stream = fs.createWriteStream(filePath, { encoding: 'utf8' });
  }

  async write(item: T): Promise<void> {
    this.stream.write(JSON.stringify(item) + '\n');
  }

  async close(): Promise<void> {
    await new Promise<void>((resolve) => this.stream.end(resolve));
  }
}
