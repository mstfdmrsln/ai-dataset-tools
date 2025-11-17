import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { SimplePipeline } from "../core/pipeline";

export interface ShardedJsonlRunnerOptions<I, O = I> {
  inputPath: string;
  outputPath: string;
  pipeline: SimplePipeline<I, O>;
  shardSize?: number;
  concurrentShards?: number;
}

async function processShardFile<I, O>(
  pipeline: SimplePipeline<I, O>,
  records: I[],
  shardFilePath: string
): Promise<void> {
  const ws = fs.createWriteStream(shardFilePath, { encoding: "utf8" });
  for (const rec of records) {
    const out = await pipeline.run(rec);
    if (out != null) {
      ws.write(JSON.stringify(out) + "\n");
    }
  }
  await new Promise<void>((resolve, reject) => {
    ws.end(() => resolve());
    ws.on("error", reject);
  });
}

async function appendFileToStream(srcPath: string, dest: fs.WriteStream): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const rs = fs.createReadStream(srcPath);
    rs.on("error", reject);
    rs.on("end", resolve);
    rs.pipe(dest, { end: false });
  });
}

export async function runShardedJsonlJob<I, O = I>(
  opts: ShardedJsonlRunnerOptions<I, O>
): Promise<void> {
  const shardSize = opts.shardSize ?? 10000;
  const concurrentShards = opts.concurrentShards ?? 2;

  const tempDir = opts.outputPath + ".shards";
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const inputStream = fs.createReadStream(opts.inputPath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity
  });

  let buffer: I[] = [];
  let shardIndex = 0;
  const activeShardPromises: Promise<void>[] = [];

  async function scheduleShard(records: I[]): Promise<void> {
    const filePath = path.join(tempDir, `shard-${shardIndex}.jsonl`);
    shardIndex += 1;
    const p = processShardFile(opts.pipeline, records, filePath);
    activeShardPromises.push(p);
    if (activeShardPromises.length >= concurrentShards) {
      await Promise.race(
        activeShardPromises.map(pr =>
          pr.then(() => {
            const idx = activeShardPromises.indexOf(pr);
            if (idx >= 0) activeShardPromises.splice(idx, 1);
          })
        )
      );
    }
  }

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const obj = JSON.parse(trimmed) as I;
    buffer.push(obj);
    if (buffer.length >= shardSize) {
      const shardRecords = buffer;
      buffer = [];
      await scheduleShard(shardRecords);
    }
  }

  if (buffer.length > 0) {
    await scheduleShard(buffer);
    buffer = [];
  }

  await Promise.all(activeShardPromises);

  const outStream = fs.createWriteStream(opts.outputPath, { encoding: "utf8" });

  for (let i = 0; i < shardIndex; i++) {
    const shardPath = path.join(tempDir, `shard-${i}.jsonl`);
    if (fs.existsSync(shardPath)) {
      await appendFileToStream(shardPath, outStream);
      fs.unlinkSync(shardPath);
    }
  }

  await new Promise<void>((resolve, reject) => {
    outStream.end(() => resolve());
    outStream.on("error", reject);
  });

  fs.rmdirSync(tempDir);
}
