# FAQ

## General Questions

### What is readme-sync?

readme-sync is a zero-dependency CLI tool that automatically extracts live code snippets from source files and injects them into markdown documentation.

### Why use readme-sync?

- Keep documentation in sync with actual code
- Prevent documentation drift
- Zero dependencies (uses only native Node.js modules)
- Works with any markdown file

### What languages are supported?

See [Supported Languages](#supported-languages). readme-sync auto-detects 75+ languages from file extensions.

## Usage

### How do I sync a specific file?

```bash
readme-sync -f docs/API.md
```

### Can I sync multiple files at once?

Yes, by having multiple sync blocks in your markdown:

```markdown
<!-- sync-start: src/auth.js -->
```javascript
```
<!-- sync-end: src/auth.js -->

<!-- sync-start: src/routes.js -->
```javascript
```
<!-- sync-end: src/routes.js -->
```

### How do I check if my README is synced?

```bash
readme-sync -c
```

### Can I use this in CI/CD?

Yes! See [GitHub Actions](#github-actions) section.

## Troubleshooting

### "File not found" errors

The path in the sync tag is relative to the markdown file's directory:

```markdown
<!-- sync-start: src/utils.js -->  <!-- Relative to README.md -->
```

### Sync tags not recognized

Make sure tags are on their own line:

```markdown
✓ <!-- sync-start: file.js -->
✗ text <!-- sync-start: file.js -->
```

### Content not updating

Check that:
1. Source file actually has content
2. File path is correct (case-sensitive on some systems)
3. You have write permissions

### Nested sync blocks

While technically possible, nested blocks can be confusing. Example:

```markdown
<!-- sync-start: outer.js -->
<!-- sync-start: inner.js -->
```javascript
inner code
```
<!-- sync-end: inner.js -->
```javascript
outer code
```
<!-- sync-end: outer.js -->
```

This parses both blocks independently (inner first, then outer).

## Supported Languages

| Extension | Language |
|-----------|----------|
| `.js`, `.mjs`, `.cjs` | JavaScript |
| `.ts`, `.tsx` | TypeScript |
| `.py` | Python |
| `.rs` | Rust |
| `.go` | Go |
| `.java` | Java |
| `.rb` | Ruby |
| `.php` | PHP |
| `.swift` | Swift |
| `.kt` | Kotlin |
| `.cs` | C# |
| `.cpp`, `.hpp` | C++ |
| `.c`, `.h` | C |

...and 75+ more.

## Configuration

### Can I customize language detection?

Yes! Use a `.readme-sync.json` config file:

```json
{
  "languages": {
    ".custom": "javascript"
  }
}
```

### How do I ignore certain files?

```json
{
  "ignore": [
    "node_modules/**",
    "*.test.js"
  ]
}
```

### Can I use a different config file?

Yes:

```bash
readme-sync --config /path/to/config.json
```

## Watch Mode

### How does watch mode work?

```bash
readme-sync -w
```

Watches all source files referenced in sync blocks and automatically syncs when they change.

### Can I watch specific files?

Watch mode watches all files in existing sync blocks. To add new files, first add the sync blocks to markdown, then start watch mode.

## Performance

### How fast is it?

See `npm run benchmark` results. Typical performance:
- Parse: ~300μs per block
- Sync: ~1ms per block

### Can it handle large files?

Yes. Tested with:
- 100+ blocks in single file
- Large code blocks (8000+ lines)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE).
