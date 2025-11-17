export interface Task<T, R> {
  payload: T;
  resolve: (v: R) => void;
  reject: (e: any) => void;
}

export class WorkerPool<T, R> {
  private queue: Task<T, R>[] = [];
  private active = 0;

  constructor(private size: number, private handler: (p: T) => Promise<R>) {}

  async run(payload: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push({ payload, resolve, reject });
      this.consume();
    });
  }

  private async consume() {
    if (this.active >= this.size) return;
    const task = this.queue.shift();
    if (!task) return;

    this.active++;
    try {
      const result = await this.handler(task.payload);
      task.resolve(result);
    } catch (err) {
      task.reject(err);
    }
    this.active--;

    if (this.queue.length > 0) this.consume();
  }
}
