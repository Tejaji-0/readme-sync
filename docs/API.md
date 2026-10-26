# API Documentation

> Auto-generated from JSDoc comments

## benchmark.js

Benchmark Module Performance testing for readme-sync operations Zero dependencies - uses native process.hrtime /

Timer class for high-resolution timing /

Format milliseconds to human readable /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| ms | `number` | Milliseconds |

**Returns:** `string` - 

Format bytes to human readable /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| bytes | `number` |  |

**Returns:** `string` - 

Run benchmark on a function /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| fn | `Function` | Function to benchmark |
| iterations | `number` | Number of iterations |

**Returns:** `Object` - - Benchmark results

Run comprehensive benchmarks on readme-sync operations /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| testDir | `string` | Directory with test files |

Print benchmark results as table /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| results | `Array` |  |

## cli.js

CLI Module Command-line argument parsing and flag handling Zero dependencies - uses only process.argv /

CLI options structure @property {string} file - Target markdown file path @property {boolean} check - Dry-run check mode @property {boolean} version - Show version flag @property {boolean} help - Show help flag @property {boolean} valid - Whether parsing succeeded @property {string|null} error - Error message if invalid /

Parse command-line arguments /

**Returns:** `CliOptions` - 

Show help text /

Show version /

## config.js

Configuration Module Loads and validates configuration from .readme-sync.json files Zero dependencies - uses only native fs and path /

Default configuration @type {Object} /

// Custom language mappings (extension -> markdown identifier) languages: {}, // Require code fences even if source file is empty requireFences: false, // Trim trailing whitespace from injected code trimTrailingWhitespace: true, // Add newline at end of file if missing ensureFinalNewline: true }; Validates configuration object /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| config | `Object` | Configuration to validate |

**Returns:** `Object` - - { valid: boolean, errors: string[] }

Loads configuration from file /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| configPath | `string` | Path to config file |
| baseDir | `string` | Base directory for relative paths |

**Returns:** `Object` - - { config: Object|null, errors: string[] }

Auto-discovers configuration file in directory tree Searches for .readme-sync.json from baseDir upwards /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| baseDir | `string` | Starting directory |

**Returns:** `Object` - - { config: Object, configPath: string|null, warnings: string[] }

Merges CLI options with config file options CLI options take precedence /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| cliOptions | `Object` | Parsed CLI options |
| configOptions | `Object` | Loaded config options |

**Returns:** `Object` - - Merged options

## glob.js

Glob Module Pattern matching for file discovery Minimal implementation - no external dependencies /

Convert glob pattern to regex Supports: * (any chars), ? (single char), ** (recursive dirs) /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| pattern | `string` | Glob pattern |

**Returns:** `RegExp` - - Equivalent regex

Check if a file path matches a glob pattern /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| filePath | `string` | File path to check |
| pattern | `string` | Glob pattern |

**Returns:** `boolean` - 

Expand glob patterns to file list /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| pattern | `string` | Glob pattern like "src/{asterisk}{asterisk}/".{asterisk}js" |
| baseDir | `string` | Base directory |

**Returns:** `string[]` - - Matching file paths (relative to baseDir)

Filter files against ignore patterns /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| files | `string[]` | Array of file paths |
| ignorePatterns | `string[]` | Array of glob patterns to exclude |

**Returns:** `string[]` - - Filtered file list

const dir = normalizedPattern.slice(0, -3); if (normalizedFile.startsWith(dir + '/')) { return false; } } // Glob match if (matchesGlob(normalizedFile, normalizedPattern)) { return false; } } return true; }); } Generate sync blocks for multiple files /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| files | `string[]` | Array of file paths |
| lang | `string` | Language override (optional) |

**Returns:** `string` - - Generated markdown blocks

## interactive.js

Interactive Module Terminal UI for selecting sync operations Zero dependencies - uses native readline /

Colors for terminal output /

Clear the terminal line /

Move cursor up /

Format file size /

Interactive selection of sync blocks /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| blocks | `Array` | Sync blocks |
| baseDir | `string` | Base directory |

**Returns:** `Promise<Array>` - - Selected blocks

Show diff between current and new content /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| current | `string` | Current block content |
| updated | `string` | New block content |

Confirm action with user /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| message | `string` | Prompt message |

**Returns:** `Promise<boolean>` - 

## parser.js

Markdown Parser Module Handles extraction and replacement of sync tags in markdown files Zero dependencies - pure regex and string manipulation /

Parsed sync block structure @property {number} startLine - Line number of <!-- sync-start --> @property {number} endLine - Line number of <!-- sync-end --> @property {string} filePath - Target file path from tag @property {string} content - Current content between tags @property {boolean} hasCodeFence - Whether content is wrapped in ``` /

Parses a markdown file to find all sync blocks Validates matching pairs and reports dangling tags /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| content | `string` | Full markdown content |

**Returns:** `Object` - - { blocks: SyncBlock[], errors: string[] }

Processes a single sync block /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| block | `Object` | The parsed block |
| baseDir | `string` | Base directory for resolving paths |

**Returns:** `Object` - - { success, replacement?, warning? }

Updates markdown content with processed blocks /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| originalContent | `string` | Original markdown content |
| blocks | `Array` | Parsed blocks |
| baseDir | `string` | Base directory |
| dryRun | `boolean` | If true, only check without modifying |

**Returns:** `Object` - - { updated, changed, warnings }

## utils.js

File System Utilities Module Provides atomic file operations and safe I/O handling Zero dependencies - uses only native Node.js modules /

Reads a file synchronously with error handling Returns null if file doesn't exist, throws on other errors /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| filePath | `string` | Absolute or relative path to file |

**Returns:** `string|null` - - File contents or null if not found

Writes file atomically using a temp file and rename Prevents corruption if process is interrupted /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| filePath | `string` | Target file path |
| content | `string` | Content to write |

Resolves a relative path from a base directory /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| baseDir | `string` | Base directory path |
| relativePath | `string` | Relative path to resolve |

**Returns:** `string` - - Absolute resolved path

Maps file extension to markdown code fence language /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| filePath | `string` | Path to source file |

**Returns:** `string` - - Language identifier for markdown

Trims leading/trailing empty lines from content /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| content | `string` | Raw file content |

**Returns:** `string` - - Trimmed content

## watch.js

Watch Module File system watching for live README synchronization Zero dependencies - uses native fs.watch (with fs.watchFile fallback) /

Creates a watcher for source files referenced in sync blocks /

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| mdFile | `string` | Path to markdown file |
| blocks | `Array` | Parsed sync blocks |
| onChange | `Function` | Callback when source files change |

**Returns:** `Object` - - { start(), stop(), isWatching() }

Debounce function to prevent rapid-fire updates /

Watch a single source file /

