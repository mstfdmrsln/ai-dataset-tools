import { DatasetStats } from './textStats';

export interface AnalyzeContext {
  stats: DatasetStats;
  languageDistribution?: Record<string, number>;
}

export function generateMarkdownReport(ctx: AnalyzeContext): string {
  const { stats, languageDistribution } = ctx;

  let md = '';
  md += '# Dataset Report\n\n';
  md += `Total records: **${stats.count}**\n\n`;
  md += '## Text length\n';
  md += `- Min: ${stats.length.min}\n`;
  md += `- Max: ${stats.length.max}\n`;
  md += `- Avg: ${stats.length.avg.toFixed(2)}\n\n`;

  if (languageDistribution) {
    md += '## Language distribution\n';
    for (const [lang, count] of Object.entries(languageDistribution)) {
      md += `- ${lang}: ${count}\n`;
    }
    md += '\n';
  }

  return md;
}
