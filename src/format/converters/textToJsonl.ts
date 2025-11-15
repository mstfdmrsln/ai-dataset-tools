import fs from 'node:fs';
import readline from 'node:readline';
import { JsonlSink } from '../../io/jsonlSink';

export async function textToJsonl(input: string, output: string): Promise<void> {
  const stream = fs.createReadStream(input, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  const sink = new JsonlSink<{ text: string }>(output);

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    await sink.write({ text: trimmed });
  }
  await sink.close();
}
