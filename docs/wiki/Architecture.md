# Architecture

`ai-dataset-tools` consists of several main layers:

- **core**: Pipeline and types
- **io**: JSONL / CSV read-write
- **nlp**: Text cleaning, dedupe, language detection
- **analysis**: Statistics and reporting
- **format**: Format converters
- **cli**: Command-line interface

Everything revolves around `SimplePipeline`, which processes data step by step using `Transformer` implementations.
