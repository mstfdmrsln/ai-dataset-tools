# ai-dataset-tools

<div align="center">

  <h3>AI Dataset Tools
  
  <p>
    <strong>Modern toolkit for cleaning, deduplicating, converting, splitting, and analyzing AI training datasets.</strong>
  </p>

  <p>
    <a href="https://www.npmjs.com/package/ai-dataset-tools">
      <img src="https://img.shields.io/npm/v/ai-dataset-tools?style=flat-square&color=blue" alt="npm version" />
    </a>
    <a href="https://www.npmjs.com/package/ai-dataset-tools">
      <img src="https://img.shields.io/npm/dm/ai-dataset-tools?style=flat-square" alt="downloads" />
    </a>
    <a href="https://github.com/mstfdmrsln/ai-dataset-tools/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/ai-dataset-tools?style=flat-square" alt="license" />
    </a>
    <a href="https://bundlephobia.com/result?p=ai-dataset-tools">
      <img src="https://img.shields.io/bundlephobia/minzip/ai-dataset-tools?style=flat-square&color=green" alt="bundle size" />
    </a>
  </p>

</div>

> A modular, high-performance toolkit for cleaning, validating, deduplicating, formatting and analyzing large-scale AI training datasets.
> Designed for real-world ML pipelines, MLOps workflows, and scalable data preparation.

ai-dataset-tools provides a modern, composable Node.js toolkit for working with text datasets at scale.
It supports JSONL, CSV, TXT and offers both CLI commands and a flexible programmatic API.

The project emphasizes reliability, parallel processing, and extensibility—suitable for everything from small research datasets to multi-GB corpora.

## 🔥 Key Features

### 🧹 Advanced Text Cleaning
- HTML & Markdown stripping
- URL / mention / hashtag removal
- Emoji filtering
- Email / phone / IP masking
- Profanity masking (optional)
- Unicode normalization
- Punctuation normalization
- Whitespace collapsing
- Length-based filtering
- Modular rules (easy to extend)

### ✔️ Text Validation
- Required field checks
- Minimum / maximum length enforcement
- Locale / language gating
- Safety / NSFW filtering hooks
- Custom rule support

### 🔁 Deduplication Engines
- Exact dedupe
- Normalized dedupe
- Fuzzy (Levenshtein) dedupe
- Embedding-based dedupe (cosine similarity)
  - Custom embedding providers (OpenAI, HF, local models)
  - Max-items retention
  - Fast incremental similarity checks

### 🧠 Embedding Generation
- Plug-and-play embedding interface
- Works with model providers or custom vectors
- Parallel embedding production
- Reusable vector cache support

### ⭐ Quality Scoring
- Rule-based or heuristic scoring
- Length, structure, punctuation, lexical variety
- Plug-in architecture for custom scoring strategies

### 🏷 Metadata Extraction
- Character / token statistics
- Language detection (via franc)
- Text length buckets
- Safety metadata hooks
- Document-level metadata merging

### 🧩 Task Formatting (Instruction/Chat/LLM)
Transform raw text into training-ready formats:
- Alpaca
- ChatML
- OpenAI Chat
- LLaMA-3
- QA
- Dialogue
- Classification
- Summarization
- Translation
- Field remapping

### ⚡ Parallel & Distributed Processing

#### Worker Pool
- CPU-parallel transformation
- Batches and message-passing
- Automatic worker recycling

#### ParallelPipeline
- Run multiple transformers in parallel
- Preserve ordering
- Failure isolation

#### Sharded JSONL Runner
- Stream JSONL without loading into memory
- Automatic sharding into N balanced output files
- Chunked reading
- Backpressure-aware streaming

### 📊 Dataset Analysis
- Token/character distributions
- Length analysis
- Language distribution reports
- Markdown summary generation
- Dataset fingerprints

### 🛠 YAML/JSON Pipelines (CLI)
Define reusable dataset workflows:

```yaml
steps:
  - text_cleaner:
      removeHtml: true
      removeUrls: true
      lowercase: true
  - dedupe:
      fuzzy: true
      threshold: 0.85
  - validator:
      minLength: 20
  - format:
      mode: alpaca
```

Run via:

```bash
ai-ds run pipeline.yaml input.jsonl output.jsonl
```

## 🚀 Installation

### Global CLI
```bash
npm install -g ai-dataset-tools
```

### As a library
```bash
npm install ai-dataset-tools
```

Requires Node.js 18+.

## 🧪 Tests

Complete Vitest suite covering:
- NLP cleaning
- Deduplication engines
- Embedding dedupe
- Validator
- Metadata extractor
- Formatting
- Worker pool
- Parallel pipeline
- Sharded runner
- Pipeline core

Run:
```bash
npm test
```

## 📦 Example Usage

### Programmatic Pipeline
```ts
import { SimplePipeline } from "ai-dataset-tools";
import { TextCleaner, TextValidator } from "ai-dataset-tools/nlp";
import { FormatTransformer } from "ai-dataset-tools/format";

const pipeline = new SimplePipeline([
  new TextCleaner({ removeUrls: true, lowercase: true }),
  new TextValidator({ minLength: 5 }),
  new FormatTransformer({ mode: "alpaca" })
]);

const out = await pipeline.run({ text: "Hello world!" });
```

### CLI Usage
```bash
ai-ds clean input.jsonl -o clean.jsonl
ai-ds dedupe clean.jsonl -o deduped.jsonl
ai-ds analyze deduped.jsonl -o report.md
ai-ds shard deduped.jsonl --shards 4 ./sharded/
```

## 🤝 Contributing
PRs are welcome. For major changes, open an issue to discuss them first.

## 📄 License
MIT © 2025
