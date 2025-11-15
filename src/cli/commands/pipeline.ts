import { Command } from 'commander';
import fs from 'node:fs';
import YAML from 'yaml';
import { JsonlSource } from '../../io/jsonlSource';
import { JsonlSink } from '../../io/jsonlSink';
import { SimplePipeline } from '../../core/pipeline';
import { TextCleaner } from '../../nlp/textCleaner';
import { TextDeduper } from '../../nlp/textDeduper';
import { FuzzyTextDeduper } from '../../nlp/fuzzyDeduper';
import { TextRecord } from '../../nlp/textTypes';

interface PipelineConfig {
  input: string;
  output: string;
  steps: Array<
    | { clean: any }
    | { dedupe: any }
  >;
}

export function registerPipelineCommand(program: Command) {
  program
    .command('pipeline')
    .description('Run a dataset processing pipeline defined in a YAML config.')
    .requiredOption('-c, --config <file>', 'YAML pipeline config file')
    .action(async (opts) => {
      const configRaw = fs.readFileSync(opts.config, 'utf8');
      const config = YAML.parse(configRaw) as PipelineConfig;

      const transformers = [];

      for (const step of config.steps) {
        if ('clean' in step) {
          transformers.push(new TextCleaner(step.clean));
        } else if ('dedupe' in step) {
          const mode = step.dedupe?.mode ?? 'exact';
          if (mode === 'fuzzy') {
            transformers.push(
              new FuzzyTextDeduper({ threshold: step.dedupe?.threshold })
            );
          } else if (mode === 'normalized') {
            transformers.push(new TextDeduper('normalized'));
          } else {
            transformers.push(new TextDeduper('exact'));
          }
        }
      }

      const pipeline = new SimplePipeline<TextRecord, TextRecord>(transformers as any[]);
      const source = new JsonlSource<TextRecord>(config.input);
      const sink = new JsonlSink<TextRecord>(config.output);

      for await (const item of source.read()) {
        const out = await pipeline.run(item);
        if (out) await sink.write(out);
      }

      await sink.close();
    });
}
