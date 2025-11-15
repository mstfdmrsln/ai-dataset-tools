export interface DataSource<T> {
  read(): AsyncIterable<T>;
}

export interface DataSink<T> {
  write(item: T): Promise<void>;
  close(): Promise<void>;
}

export interface Transformer<I, O = I> {
  transform(item: I): Promise<O | null>;
}

export interface Pipeline<I, O = I> {
  run(item: I): Promise<O | null>;
}
