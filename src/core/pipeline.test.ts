import { describe, it, expect } from 'vitest';
import { SimplePipeline } from './pipeline';

describe('Pipeline', () => {
  it('runs sequential transformers', async () => {
    const t1 = { transform: async (item:any) => ({ text: item.text + "!" }) };
    const t2 = { transform: async (item:any) => ({ text: item.text + "?" }) };
    const p = new SimplePipeline([t1, t2]);
    const out:any = await p.run({ text: "hello" });
    expect(out.text).toBe("hello!?");
  });
});
