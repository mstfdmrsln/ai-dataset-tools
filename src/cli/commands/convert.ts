import { Command } from 'commander';
import { csvToJsonl } from '../../format/converters/csvToJsonl';
import { jsonlToCsv } from '../../format/converters/jsonlToCsv';
import { textToJsonl } from '../../format/converters/textToJsonl';

export function registerConvertCommand(program: Command) {
  program
    .command('convert')
    .description('Convert between dataset formats (csv, jsonl, text).')
    .requiredOption('-i, --input <file>', 'Input file')
    .requiredOption('-o, --output <file>', 'Output file')
    .requiredOption('--from <type>', 'Source format (csv|jsonl|text)')
    .requiredOption('--to <type>', 'Target format (csv|jsonl)')
    .action(async (opts) => {
      const from = (opts.from as string).toLowerCase();
      const to = (opts.to as string).toLowerCase();

      if (from === 'csv' && to === 'jsonl') {
        await csvToJsonl(opts.input, opts.output);
      } else if (from === 'jsonl' && to === 'csv') {
        await jsonlToCsv(opts.input, opts.output);
      } else if (from === 'text' && to === 'jsonl') {
        await textToJsonl(opts.input, opts.output);
      } else {
        throw new Error(`Unsupported conversion: ${from} -> ${to}`);
      }
    });
}
