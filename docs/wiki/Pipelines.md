# Pipelines

Pipelines are defined using YAML files.

Example:

```yaml
input: data/raw.jsonl
output: data/processed.jsonl

steps:
  - clean:
      removeHtml: true
      removeUrls: true
      lowercase: true

  - dedupe:
      mode: normalized
```

Run:

```bash
ai-dataset-tools pipeline --config pipeline.yaml
```
