# ai-dataset-tools

> Modern, scriptable toolkit for cleaning, deduplicating, converting, splitting and analyzing AI training datasets.

`ai-dataset-tools` is a lightweight yet powerful toolkit designed for developers, data scientists, and MLOps teams working with text-based datasets.  
It works with formats such as JSONL / CSV / TXT and provides both a CLI and a programmatic API.

## ✨ Features

- 🧹 **Text Cleaning**
  - HTML tags, URLs, mentions, hashtags, emojis
  - Unicode normalization, whitespace and punctuation cleanup

- 🔁 **Deduplication**
  - Exact and normalized comparison
  - Fuzzy similarity filtering (Levenshtein-based)

- 🌍 **Language Detection**
  - Automatic language detection powered by `franc`
  - Language distribution analysis

- 🔄 **Format Conversion**
  - CSV ⇆ JSONL
  - TXT → JSONL (one record per line)

- ✂️ **Dataset Split**
  - Deterministic train / dev / test splitting
  - Seed-based shuffling

- 📊 **Analysis & Reporting**
  - Record counts, length statistics
  - Markdown report generation

- 🧩 **YAML-based Pipeline**
  - End-to-end cleaning + dedupe flow in a single file
  - Executable via CLI

## 🚀 Installation

Global installation:

```bash
npm install -g ai-dataset-tools
```

Local installation:

```bash
npm install ai-dataset-tools --save-dev
```

Requires Node 18+.

## 📄 License

MIT License.
