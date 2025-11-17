export interface DataSource<T> {
  read(): AsyncIterable<T>;
}

export interface DataSink<T> {
  write(item: T): Promise<void>;
  close(): Promise<void>;
}

export interface Transformer<IN, OUT = IN> {
  transform(item: IN): Promise<OUT | null>;
}

export interface Pipeline<I, O = I> {
  run(item: I): Promise<O | null>;
}
