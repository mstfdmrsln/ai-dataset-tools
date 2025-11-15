import { CsvSource } from '../../io/csvSource';
import { JsonlSink } from '../../io/jsonlSink';

export async function csvToJsonl(input: string, output: string): Promise<void> {
  const source = new CsvSource<any>(input);
  const sink = new JsonlSink<any>(output);

  for await (const row of source.read()) {
    await sink.write(row);
  }
  await sink.close();
}
