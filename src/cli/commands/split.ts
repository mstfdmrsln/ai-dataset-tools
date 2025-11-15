import { Command } from 'commander';
import { JsonlSource } from '../../io/jsonlSource';
import { JsonlSink } from '../../io/jsonlSink';
import { TextRecord } from '../../nlp/textTypes';

export function registerSplitCommand(program: Command) {
  program
    .command('split')
    .description('Split a JSONL dataset into train/dev/test parts.')
    .requiredOption('-i, --input <file>', 'Input JSONL file')
    .option('--train <n>', 'Train percentage', '80')
    .option('--dev <n>', 'Dev/validation percentage', '10')
    .option('--test <n>', 'Test percentage', '10')
    .option('--seed <n>', 'Random seed', '42')
    .action(async (opts) => {
      const trainPct = parseFloat(opts.train as string);
      const devPct = parseFloat(opts.dev as string);
      const testPct = parseFloat(opts.test as string);

      const totalPct = trainPct + devPct + testPct;
      if (Math.abs(totalPct - 100) > 0.001) {
        throw new Error('train + dev + test must equal 100');
      }

      const source = new JsonlSource<TextRecord>(opts.input);
      const records: TextRecord[] = [];
      for await (const item of source.read()) {
        records.push(item);
      }

      // deterministik shuffle
      const seed = parseInt(opts.seed as string, 10);
      let rng = mulberry32(seed);
      for (let i = records.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [records[i], records[j]] = [records[j], records[i]];
      }

      const n = records.length;
      const nTrain = Math.floor((trainPct / 100) * n);
      const nDev = Math.floor((devPct / 100) * n);

      const trainRecords = records.slice(0, nTrain);
      const devRecords = records.slice(nTrain, nTrain + nDev);
      const testRecords = records.slice(nTrain + nDev);

      const base = opts.input.replace(/\.jsonl$/i, '');
      const trainPath = `${base}.train.jsonl`;
      const devPath = `${base}.dev.jsonl`;
      const testPath = `${base}.test.jsonl`;

      const trainSink = new JsonlSink<TextRecord>(trainPath);
      const devSink = new JsonlSink<TextRecord>(devPath);
      const testSink = new JsonlSink<TextRecord>(testPath);

      for (const r of trainRecords) await trainSink.write(r);
      for (const r of devRecords) await devSink.write(r);
      for (const r of testRecords) await testSink.write(r);

      await trainSink.close();
      await devSink.close();
      await testSink.close();
    });
}

// basit deterministik RNG
function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
