# Advanced Usage Patterns

## Pattern 1: Multiple Documentation Files

Sync multiple files from the same source:

```markdown
<!-- README.md -->
## Installation
<!-- sync-start: docs/install.md -->
```bash
npm install my-package
```
<!-- sync-end: docs/install.md -->

<!-- API.md -->
## Quick Start
<!-- sync-start: docs/install.md -->
```bash
npm install my-package
```
<!-- sync-end: docs/install.md -->
```

Both files will have the same content synced from `docs/install.md`.

## Pattern 2: Partial File Sync

Sync only specific sections using JS line comments:

```javascript
// src/api.js
// [SYNC: authentication]
function authenticate(token) {
  // auth logic
}
// [END: authentication]

// [SYNC: public-methods]
function getUser() {
  // user logic
}
// [END: public-methods]
```

Then in markdown:
```markdown
## Authentication
<!-- sync-start: src/api.js#authentication -->
```javascript
function authenticate(token) {
  // auth logic
}
```
<!-- sync-end: src/api.js#authentication -->

## Pattern 3: Concatenated Sync

Combine multiple files into one block:

```markdown
## Full Source
<!-- sync-start: src/part1.js -->
```javascript
// Part 1
```
<!-- sync-end: src/part1.js -->

<!-- sync-start: src/part2.js -->
```javascript
// Part 2
```
<!-- sync-end: src/part2.js -->

<!-- sync-start: src/part3.js -->
```javascript
// Part 3
```
<!-- sync-end: src/part3.js -->
```

## Pattern 4: Version-Specific Documentation

Use different files for different versions:

```json
{
  "readme-sync": {
    "file": "README-v2.md",
    "include": ["src/v2/**"],
    "exclude": ["src/v1/**"]
  }
}
```

## Pattern 5: Template System

Create reusable templates:

```markdown
<!-- template.md -->
## {{name}}

<!-- sync-start: {{source}} -->
```{{lang}}
```
<!-- sync-end: {{source}} -->

### Examples

<!-- sync-start: examples/{{name}}.js -->
```javascript
// {{name}} example
```
<!-- sync-end: examples/{{name}}.js -->
```

Use with a generator:

```javascript
const fs = require('fs');
const template = fs.readFileSync('template.md', 'utf-8');

const data = { name: 'utils', source: 'src/utils.js', lang: 'javascript' };
const output = template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key]);
fs.writeFileSync('generated.md', output);
```

## Pattern 6: CI/CD Badge Integration

Sync badges from config:

```markdown
<!-- README.md -->
<!-- sync-start: .github/badges.md -->
[![Tests](https://img.shields.io/badge/tests-passing-success)](tests)
[![Coverage](https://img.shields.io/badge/coverage-95%25-success)](coverage)
<!-- sync-end: .github/badges.md -->
```

Update badges programmatically in CI:

```bash
# Update badge config based on test results
echo "[![Tests](https://img.shields.io/badge/tests-$STATUS-$COLOR)]" > .github/badges.md
readme-sync
```

## Pattern 7: Conditional Sync

Use environment variables:

```bash
# Development mode - sync everything
DEV_MODE=true readme-sync

# Production mode - only stable files
STABLE_ONLY=true readme-sync -f README.md
```

With config:

```json
{
  "readme-sync": {
    "conditional": {
      "STABLE_ONLY": {
        "include": ["src/stable/**"]
      }
    }
  }
}
```

## Pattern 8: Mono-repo Documentation

Sync from multiple packages:

```markdown
<!-- root/README.md -->
## Packages

### Utils
<!-- sync-start: packages/utils/README.md -->
<!-- Automatically synced -->
<!-- sync-end: packages/utils/README.md -->

### Core
<!-- sync-start: packages/core/README.md -->
<!-- Automatically synced -->
<!-- sync-end: packages/core/README.md -->
```

## Pattern 9: API Documentation Generator

Generate docs from JSDoc:

```bash
# First generate intermediate file
jsdoc src/*.js -d docs/jsdoc
readme-sync -f docs/API.md
```

## Pattern 10: Changelog Sync

Keep changelog sections in sync:

```markdown
<!-- CHANGELOG.md -->
## [Unreleased]
<!-- sync-start: .github/unreleased.md -->
- Current changes
<!-- sync-end: .github/unreleased.md -->

## [1.0.0] - 2024-01-15
<!-- sync-start: .github/releases/v1.0.0.md -->
- Released version
<!-- sync-end: .github/releases/v1.0.0.md -->
```
