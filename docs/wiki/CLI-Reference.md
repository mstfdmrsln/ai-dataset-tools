# CLI Reference

## General

```bash
ai-dataset-tools --help
```

## Commands

### `clean`

Normalizes and cleans text records.

Example:

```bash
ai-dataset-tools clean -i input.jsonl -o output.jsonl --html --urls --lowercase
```

### `dedupe`

Removes duplicate and near-duplicate records.

```bash
ai-dataset-tools dedupe -i clean.jsonl -o dedup.jsonl --mode normalized
```

### `analyze`

Extracts dataset statistics and optionally generates a report.

```bash
ai-dataset-tools analyze -i dedup.jsonl --report report.md --language-dist
```

### `convert`

Convert between formats.

```bash
ai-dataset-tools convert -i data.csv -o data.jsonl --from csv --to jsonl
```

### `split`

Train/dev/test split.

```bash
ai-dataset-tools split -i data.jsonl --train 80 --dev 10 --test 10 --seed 42
```

### `pipeline`

Runs a YAML-based pipeline.

```bash
ai-dataset-tools pipeline --config pipeline.yaml
```
