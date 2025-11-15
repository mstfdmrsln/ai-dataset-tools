import { Command } from 'commander';
import fs from 'node:fs';
import { JsonlSource } from '../../io/jsonlSource';
import { computeTextStats } from '../../analysis/textStats';
import { generateMarkdownReport } from '../../analysis/reportGenerator';
import { LanguageDetector } from '../../nlp/languageDetector';
import { TextRecord } from '../../nlp/textTypes';

export function registerAnalyzeCommand(program: Command) {
  program
    .command('analyze')
    .description('Analyze a JSONL text dataset and optionally output a report.')
    .requiredOption('-i, --input <file>', 'Input JSONL file')
    .option('-r, --report <file>', 'Output Markdown report file')
    .option('--language-dist', 'Include language distribution')
    .option('--sample <n>', 'Number of records to sample for analysis', '10000')
    .action(async (opts) => {
      const source = new JsonlSource<TextRecord>(opts.input);
      const detector = new LanguageDetector();

      const records: TextRecord[] = [];
      const sampleLimit = parseInt(opts.sample as string, 10);

      const langCounts: Record<string, number> = {};

      for await (const item of source.read()) {
        records.push(item);
        if (opts.languageDist) {
          const res = detector.detect(item.text ?? '');
          if (res) {
            langCounts[res.lang] = (langCounts[res.lang] || 0) + 1;
          }
        }
        if (records.length >= sampleLimit) break;
      }

      const stats = computeTextStats(records);

      const ctx = {
        stats,
        languageDistribution: opts.languageDist ? langCounts : undefined
      };

      const report = generateMarkdownReport(ctx);

      if (opts.report) {
        fs.writeFileSync(opts.report, report, 'utf8');
      } else {
        // eslint-disable-next-line no-console
        console.log(report);
      }
    });
}
