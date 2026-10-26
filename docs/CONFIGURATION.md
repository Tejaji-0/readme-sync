# Configuration Examples

## Language-Specific Configurations

### Python Project

```json
{
  "readme-sync": {
    "file": "README.md",
    "ignore": [
      "__pycache__/**",
      "*.pyc",
      ".venv/**",
      "venv/**"
    ],
    "languages": {
      ".py": "python",
      ".pyi": "python",
      ".pyx": "cython",
      ".ipynb": "json"
    }
  }
}
```

### Rust Project

```json
{
  "readme-sync": {
    "file": "README.md",
    "ignore": [
      "target/**",
      "Cargo.lock"
    ],
    "languages": {
      ".rs": "rust",
      ".toml": "toml"
    }
  }
}
```

### Go Project

```json
{
  "readme-sync": {
    "file": "README.md",
    "ignore": [
      "vendor/**",
      "go.sum"
    ]
  }
}
```

## Advanced Configurations

### Monorepo Setup

```json
{
  "readme-sync": {
    "file": "docs/README.md",
    "ignore": [
      "**/node_modules/**",
      "**/target/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/coverage/**",
      "**/*.test.js",
      "**/*.spec.js"
    ],
    "languages": {
      ".mjs": "javascript",
      ".cjs": "javascript",
      ".jsx": "jsx",
      ".tsx": "tsx"
    }
  }
}
```

### Documentation Site

```json
{
  "readme-sync": {
    "file": "docs/getting-started.md",
    "ignore": [
      "node_modules/**",
      ".vuepress/**",
      ".docusaurus/**"
    ]
  }
}
```

## CI/CD Integration

### GitHub Actions Matrix

```yaml
strategy:
  matrix:
    file:
      - README.md
      - docs/api.md
      - docs/guide.md
steps:
  - run: readme-sync -f ${{ matrix.file }} -c
```

### Pre-commit Config

```yaml
# .pre-commit-config.yaml (for pre-commit framework)
repos:
  - repo: local
    hooks:
      - id: readme-sync
        name: Sync README
        entry: node bin/readme-sync.js -c
        language: system
        pass_filenames: false
```
