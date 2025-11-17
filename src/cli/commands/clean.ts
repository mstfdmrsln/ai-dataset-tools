import { Command } from 'commander';
import { JsonlSource } from '../../io/jsonlSource';
import { JsonlSink } from '../../io/jsonlSink';
import { SimplePipeline } from '../../core/pipeline';
import { TextCleaner } from '../../nlp/textCleaner';
import { TextRecord } from '../../nlp/textTypes';

export function registerCleanCommand(program: Command) {
  program
    .command("clean")
    .requiredOption("-i, --input <path>", "Input JSONL file")
    .requiredOption("-o, --output <path>", "Output JSONL file")
    .option("--html", "Remove HTML tags")
    .option("--urls", "Remove URLs")
    .option("--mentions", "Remove @mentions")
    .option("--hashtags", "Remove #hashtags")
    .option("--emojis", "Remove emojis")
    .option("--lowercase", "Lowercase text")
    .option("--unicode", "Unicode normalize (NFKC)")
    .option("--normalize-punctuation", "Normalize punctuation")
    .option("--collapse-spaces", "Collapse multiple spaces")

    .option("--mask-emails", "Mask emails as [EMAIL]")
    .option("--mask-phones", "Mask phone numbers as [PHONE]")
    .option("--mask-ip", "Mask IP addresses as [IP]")
    .option("--strip-markdown", "Strip Markdown syntax")
    .option("--ai-boilerplate", "Remove common AI boilerplate phrases")
    .option("--min-length <n>", "Drop texts shorter than N chars", (v) => parseInt(v, 10))
    .option("--max-length <n>", "Drop texts longer than N chars", (v) => parseInt(v, 10))
    .action(async (opts) => {
      const source = new JsonlSource<TextRecord>(opts.input);
      const sink = new JsonlSink<TextRecord>(opts.output);
      const cleaner = new TextCleaner({
        removeHtml: opts.html,
        removeUrls: opts.urls,
        removeMentions: opts.mentions,
        removeHashtags: opts.hashtags,
        removeEmojis: opts.emojis,
        lowercase: opts.lowercase,
        unicodeNormalize: opts.unicode,
        normalizePunctuation: opts.normalizePunctuation,
        collapseSpaces: opts.collapseSpaces,
        maskEmails: opts.maskEmails,
        maskPhones: opts.maskPhones,
        maskIpAddresses: opts.maskIp,
        stripMarkdown: opts.stripMarkdown,
        removeAIContentBoilerplate: opts.aiBoilerplate,
        minLength: opts.minLength,
        maxLength: opts.maxLength
      });

      const pipeline = new SimplePipeline<TextRecord, TextRecord>([cleaner]);

      for await (const item of source.read()) {
        const out = await pipeline.run(item);
        if (out) await sink.write(out);
      }

      await sink.close();
    });
}
