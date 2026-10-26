# readme-sync

A zero-dependency CLI tool that automatically extracts live code snippets from source files and injects them into markdown documentation.

## Features

- ✅ **Zero external dependencies** (uses only native Node.js modules)
- ✅ **Automatic code fence language detection** (40+ languages supported)
- ✅ **CI/CD check mode** for validation in GitHub Actions
- ✅ **Watch mode** for live reloading during development
- ✅ **Interactive mode** for selective sync operations
- ✅ **Atomic file writes** to prevent corruption
- ✅ **Configuration file** support (`.github/sync.yml`)
- ✅ **Verbose and silent** output modes
- ✅ **Clear error messages** with line numbers

## Installation

```bash
npm install -g readme-sync
```

## Usage

### Basic Example

Here's an example utility module:

<!-- sync-start: examples/utils.js -->
```javascript
/**
 * Example utility module for testing readme-sync
 */

/**
 * Adds two numbers together
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - Sum of a and b
 */
function add(a, b) {
  return a + b;
}

/**
 * Greets a user with a personalized message
 * @param {string} name - The user's name
 * @returns {string} - Greeting message
 */
function greet(name) {
  return `Hello, ${name}!`;
}

module.exports = { add, greet };
```
<!-- sync-end: examples/utils.js -->

### CLI Options

```bash
readme-sync [options]

Options:
  -f, --file <path>    Target markdown file (default: README.md)
  -c, --check          Dry-run validation mode (CI/CD)
  -w, --watch          Watch source files for changes and auto-sync
  -i, --interactive    Interactive mode - select which blocks to sync
  --verbose            Enable verbose output with detailed logging
  --silent             Suppress all output except errors
  --config <path>      Use custom configuration file
  -v, --version        Show version number
  -h, --help           Show this help message
```

### Examples

```bash
# Basic sync
readme-sync

# Sync specific file
readme-sync -f docs/API.md

# Check mode (CI/CD)
readme-sync -c

# Watch mode (auto-sync on file changes)
readme-sync -w

# Interactive mode (select blocks to sync)
readme-sync -i

# Verbose output
readme-sync --verbose

# Silent (only errors)
readme-sync --silent

# Custom config
readme-sync --config my-config.json
```

## GitHub Actions

Add automatic README checking to your CI/CD pipeline:

<!-- sync-start: .github/workflows/readme-sync.yml -->
```yaml
name: readme-sync Check

on:
  push:
    branches: [ main, master ]
    paths:
      - '**.md'
      - '**.js'
      - '**.ts'
      - '**.py'
      - 'examples/**'
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    name: Check README Sync
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Cache Node.js modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ matrix.node-version }}-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-${{ matrix.node-version }}-
      
      - name: Run readme-sync check
        id: sync-check
        run: |
          echo "::group::Checking README synchronization"
          node bin/readme-sync.js --check --verbose
          echo "::endgroup::"
        continue-on-error: true
      
      - name: Auto-fix if out of sync (push only)
        if: steps.sync-check.outcome == 'failure' && github.event_name == 'push'
        run: |
          echo "::warning::README.md is out of sync. Auto-fixing..."
          node bin/readme-sync.js --verbose
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add README.md
          git commit -m "docs: auto-sync README.md [skip ci]" || echo "No changes to commit"
          git push
      
      - name: Report status
        if: steps.sync-check.outcome == 'failure' && github.event_name != 'push'
        run: |
          echo "::error::README.md is out of sync with source files"
          echo ""
          echo "To fix locally, run:"
          echo "  node bin/readme-sync.js"
          echo ""
          echo "Or enable auto-fix in your workflow."
          exit 1
      
      - name: Success
        if: steps.sync-check.outcome == 'success'
        run: echo "::notice::README.md is synchronized ✓"

```
<!-- sync-end: .github/workflows/readme-sync.yml -->

## Configuration

The tool looks for the following tags in your markdown:

## Pre-commit Hook

Automatically sync before committing:

<!-- sync-start: examples/pre-commit-hook.sh -->
```bash
#!/bin/sh
# Pre-commit hook for readme-sync
# Place this file in .git/hooks/pre-commit (and make it executable)
#
# This hook ensures README is synchronized before committing

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}Checking README synchronization...${NC}"

# Run readme-sync in check mode
if node bin/readme-sync.js --check --silent; then
    echo "${GREEN}✓ README is synchronized${NC}"
    exit 0
else
    echo "${RED}✗ README is out of sync${NC}"
    echo "${YELLOW}Running readme-sync to fix...${NC}"
    
    if node bin/readme-sync.js --silent; then
        echo "${GREEN}✓ README updated. Please review and re-commit.${NC}"
        exit 1
    else
        echo "${RED}✗ Failed to update README${NC}"
        exit 1
    fi
fi
```
<!-- sync-end: examples/pre-commit-hook.sh -->

To install:

```bash
cp examples/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```
<!-- sync-start: examples/config.json -->
```json
{
  "readme-sync": {
    "autoSync": true,
    "extensions": [".js", ".ts", ".py", ".json"],
    "ignoreFiles": ["node_modules", ".git"]
  }
}
```
<!-- sync-end: examples/config.json -->

## License

MIT
