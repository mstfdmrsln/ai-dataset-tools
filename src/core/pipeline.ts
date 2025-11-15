import { Pipeline, Transformer } from './types';

export class SimplePipeline<I, O = I> implements Pipeline<I, O> {
  constructor(private steps: Transformer<any, any>[]) {}

  async run(item: I): Promise<O | null> {
    let current: any = item;
    for (const step of this.steps) {
      current = await step.transform(current);
      if (current == null) return null;
    }
    return current as O;
  }
}
