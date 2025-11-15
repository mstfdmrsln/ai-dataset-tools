# Getting Started

## Installation

```bash
npm install -g ai-dataset-tools
```

or inside a project:

```bash
npm install ai-dataset-tools --save-dev
```

## First Command

```bash
ai-dataset-tools clean -i data/raw.jsonl -o data/clean.jsonl --html --urls
```

This command cleans text records from `raw.jsonl` and writes them to `clean.jsonl`.
