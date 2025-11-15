import { JsonlSource } from '../../io/jsonlSource';
import { CsvSink } from '../../io/csvSink';

export async function jsonlToCsv(input: string, output: string): Promise<void> {
  const source = new JsonlSource<any>(input);
  const sink = new CsvSink<any>(output);

  for await (const row of source.read()) {
    await sink.write(row);
  }
  await sink.close();
}
