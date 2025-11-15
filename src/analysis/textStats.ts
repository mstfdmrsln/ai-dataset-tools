import { TextRecord } from '../nlp/textTypes';

export interface LengthStats {
  min: number;
  max: number;
  avg: number;
}

export interface DatasetStats {
  count: number;
  length: LengthStats;
}

export function computeTextStats(records: TextRecord[]): DatasetStats {
  let count = 0;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (const r of records) {
    const len = (r.text ?? '').length;
    count++;
    if (len < min) min = len;
    if (len > max) max = len;
    sum += len;
  }

  if (count === 0) {
    return {
      count: 0,
      length: { min: 0, max: 0, avg: 0 }
    };
  }

  return {
    count,
    length: {
      min,
      max,
      avg: sum / count
    }
  };
}
