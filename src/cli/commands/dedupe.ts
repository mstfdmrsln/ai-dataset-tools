import { Command } from 'commander';
import { JsonlSource } from '../../io/jsonlSource';
import { JsonlSink } from '../../io/jsonlSink';
import { SimplePipeline } from '../../core/pipeline';
import { TextDeduper } from '../../nlp/textDeduper';
import { FuzzyTextDeduper } from '../../nlp/fuzzyDeduper';
import { TextRecord } from '../../nlp/textTypes';

export function registerDedupeCommand(program: Command) {
  program
    .command('dedupe')
    .description('Remove duplicate or near-duplicate records from a JSONL text dataset.')
    .requiredOption('-i, --input <file>', 'Input JSONL file')
    .requiredOption('-o, --output <file>', 'Output JSONL file')
    .option('--mode <mode>', 'exact|normalized|fuzzy', 'exact')
    .option('--similarity <number>', 'Similarity threshold for fuzzy mode (0-1)', '0.9')
    .action(async (opts) => {
      const source = new JsonlSource<TextRecord>(opts.input);
      const sink = new JsonlSink<TextRecord>(opts.output);

      const mode = opts.mode as string;
      const similarity = parseFloat(opts.similarity as string);

      let transformer;
      if (mode === 'fuzzy') {
        transformer = new FuzzyTextDeduper({ threshold: similarity });
      } else if (mode === 'normalized') {
        transformer = new TextDeduper('normalized');
      } else {
        transformer = new TextDeduper('exact');
      }

      const pipeline = new SimplePipeline<TextRecord, TextRecord>([transformer]);

      for await (const item of source.read()) {
        const out = await pipeline.run(item);
        if (out) await sink.write(out);
      }

      await sink.close();
    });
}
