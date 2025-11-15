#!/usr/bin/env node
import { Command } from 'commander';
import { registerCleanCommand } from './commands/clean';
import { registerDedupeCommand } from './commands/dedupe';
import { registerAnalyzeCommand } from './commands/analyze';
import { registerConvertCommand } from './commands/convert';
import { registerSplitCommand } from './commands/split';
import { registerPipelineCommand } from './commands/pipeline';

const program = new Command();

program
  .name('ai-dataset-tools')
  .description('Toolkit for cleaning and analyzing AI datasets')
  .version('0.1.0');

registerCleanCommand(program);
registerDedupeCommand(program);
registerAnalyzeCommand(program);
registerConvertCommand(program);
registerSplitCommand(program);
registerPipelineCommand(program);

program.parse(process.argv);
