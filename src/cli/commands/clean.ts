import { Command } from 'commander';
import { JsonlSource } from '../../io/jsonlSource';
import { JsonlSink } from '../../io/jsonlSink';
import { SimplePipeline } from '../../core/pipeline';
import { TextCleaner } from '../../nlp/textCleaner';
import { TextRecord } from '../../nlp/textTypes';

export function registerCleanCommand(program: Command) {
  program
    .command('clean')
    .description('Clean and normalize a JSONL text dataset.')
    .requiredOption('-i, --input <file>', 'Input JSONL file')
    .requiredOption('-o, --output <file>', 'Output JSONL file')
    .option('--html', 'Remove HTML tags')
    .option('--urls', 'Remove URLs')
    .option('--mentions', 'Remove @mentions')
    .option('--hashtags', 'Remove #hashtags')
    .option('--lowercase', 'Convert text to lowercase')
    .option('--unicode', 'Normalize unicode (NFKC)')
    .option('--no-collapse-spaces', 'Do not collapse multiple spaces')
    .option('--remove-emojis', 'Remove emojis')
    .option('--normalize-punctuation', 'Normalize punctuation characters')
    .action(async (opts) => {
      const source = new JsonlSource<TextRecord>(opts.input);
      const sink = new JsonlSink<TextRecord>(opts.output);

      const cleaner = new TextCleaner({
        removeHtml: !!opts.html,
        removeUrls: !!opts.urls,
        removeMentions: !!opts.mentions,
        removeHashtags: !!opts.hashtags,
        lowercase: !!opts.lowercase,
        unicodeNormalize: !!opts.unicode,
        normalizePunctuation: !!opts.normalizePunctuation,
        collapseSpaces: !opts.noCollapseSpaces,
        removeEmojis: !!opts.removeEmojis
      });

      const pipeline = new SimplePipeline<TextRecord, TextRecord>([cleaner]);

      for await (const item of source.read()) {
        const out = await pipeline.run(item);
        if (out) await sink.write(out);
      }

      await sink.close();
    });
}
