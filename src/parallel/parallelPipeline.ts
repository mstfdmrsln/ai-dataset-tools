import { SimplePipeline } from "../core/pipeline";
import { WorkerPool } from "./workerPool";

export interface ParallelPipelineOptions {
  pipeline: SimplePipeline<any, any>;
  workers?: number;
  ordered?: boolean;
}

export class ParallelPipeline {
  private pool: WorkerPool<any, any>;
  private ordered: boolean;

  constructor(private opts: ParallelPipelineOptions) {
    this.ordered = opts.ordered ?? true;
    const w = opts.workers ?? 4;

    this.pool = new WorkerPool(w, (v) => this.opts.pipeline.run(v));
  }

  async processArray(items: any[]): Promise<any[]> {
    const results: any[] = new Array(items.length);

    const jobs = items.map((item, idx) =>
      this.pool.run(item).then((res) => {
        results[idx] = res;
      })
    );

    await Promise.all(jobs);

    if (this.ordered) return results;

    return results.filter((x) => x !== undefined);
  }
}
