import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { SimplePipeline } from "../core/pipeline";
import { runShardedJsonlJob } from "./shardedJsonlRunner";
import { TextCleaner } from "../nlp/textCleaner";
import { TextValidator } from "../validation/textValidator";
import { FormatTransformer } from "../format/formatTransformer";
import { TextRecord } from "../nlp/textTypes";

function makeTempFile(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-dataset-tools-"));
  return path.join(dir, prefix);
}

describe("runShardedJsonlJob", () => {
  it("streams, shards and processes large JSONL via pipeline", async () => {
    const inputPath = makeTempFile("input.jsonl");
    const outputPath = makeTempFile("output.jsonl");

    const ws = fs.createWriteStream(inputPath, { encoding: "utf8" });
    for (let i = 0; i < 100; i++) {
      const rec: TextRecord = {
        text: `<p>Hello ${i}</p> https://example.com/${i}`
      } as any;
      ws.write(JSON.stringify(rec) + "\n");
    }
    await new Promise<void>((resolve, reject) => {
      ws.end(() => resolve());
      ws.on("error", reject);
    });

    const pipeline = new SimplePipeline<TextRecord, any>([
      new TextCleaner({
        removeHtml: true,
        removeUrls: true,
        lowercase: true,
        collapseSpaces: true,
        trimSpaces: true
      }),
      new TextValidator({
        minLength: 3
      }),
      new FormatTransformer({
        mode: "alpaca",
        fields: {
          instruction: "text",
          output: "text"
        }
      })
    ]);

    await runShardedJsonlJob({
      inputPath,
      outputPath,
      pipeline,
      shardSize: 25,
      concurrentShards: 3
    });

    const content = fs.readFileSync(outputPath, "utf8");
    const lines = content
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    expect(lines.length).toBe(100);

    const first = JSON.parse(lines[0]);
    expect(first.instruction).toContain("hello 0");
    expect(first.output).toContain("hello 0");
  });
});
