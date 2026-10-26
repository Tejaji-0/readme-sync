# Troubleshooting Guide

## Common Issues

### Issue: "File not found" errors

**Symptoms:**
```
Warning: Source file not found "src/utils.js"
```

**Causes:**
1. Path is relative to markdown file, not current working directory
2. File doesn't exist yet
3. Path has incorrect capitalization (Windows is case-insensitive, but Unix isn't)

**Solutions:**

```bash
# Check where the sync tag is looking
readme-sync --verbose

# Verify file exists relative to markdown
ls "$(dirname README.md)/src/utils.js"

# Fix path format
# Wrong:  <!-- sync-start: ./src/utils.js -->
# Right:  <!-- sync-start: src/utils.js -->
```

### Issue: Sync blocks not being replaced

**Symptoms:** Code blocks stay empty or contain placeholder text

**Diagnosis:**
```bash
# Check if blocks are being found
readme-sync --verbose
```

**Common causes:**
1. Missing `sync-end` tag
2. Mismatched file paths in start/end tags
3. HTML comments malformed

**Fix:**
```markdown
<!-- Correct -->
<!-- sync-start: file.js -->
```js
// Will be replaced
```
<!-- sync-end: file.js -->

<!-- Incorrect - mismatched paths -->
<!-- sync-start: file.js -->
```js
// Won't sync properly
```
<!-- sync-end: wrong-file.js -->
```

### Issue: CI check fails

**Symptoms:** GitHub Actions shows "README is out of sync"

**Solutions:**

1. **Auto-fix enabled:**
   ```yaml
   # In your workflow
   - run: readme-sync
     if: failure()
   ```

2. **Pre-commit hook:**
   ```bash
   npm run sync  # before committing
   ```

3. **Check your .gitignore:**
   ```bash
   # Make sure README.md isn't ignored
   git check-ignore README.md  # Should be empty
   ```

### Issue: Performance slowdowns

**Symptoms:** Sync takes a long time for large files

**Solutions:**

1. Exclude large generated files:
   ```json
   {
     "ignore": ["dist/**", "*.min.js", "*.bundle.js"]
   }
   ```

2. Use check mode first to see if sync is needed:
   ```bash
   time readme-sync -c && echo "Up to date" || readme-sync
   ```

3. Profile with verbose mode:
   ```bash
   readme-sync --verbose 2>&1 | grep -E "(Read|Parse|Update|Write)"
   ```

## Platform-Specific Issues

### Windows

**Issue:** Path separators
```markdown
<!-- Use forward slashes universally -->
<!-- sync-start: src/utils.js -->  ✓
<!-- sync-start: src\\utils.js -->  ✗
```

**Issue:** Line endings
```bash
# If files show as modified in git despite no visible changes:
git config core.autocrlf true
```

### macOS/Linux

**Issue:** Permission denied
```bash
chmod +x bin/readme-sync.js
```

**Issue:** Node.js version
```bash
# Check version (requires >= 14)
node --version

# Update if needed
npm install -g n
n 20
```

## Getting Help

1. **Check FAQ:** [FAQ.md](../FAQ.md)
2. **Run verbose mode:** `readme-sync --verbose`
3. **Test with minimal case:** Create a small test file
4. **Check syntax:** Validate your sync blocks
5. **Open issue:** [GitHub Issues](../../issues)

## Debug Mode

Enable maximum debugging:

```bash
readme-sync --verbose --file debug.md 2>&1 | tee debug.log
```

This creates a log file you can attach to issue reports.
