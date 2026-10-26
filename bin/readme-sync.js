#!/usr/bin/env node

/**
 * readme-sync
 * A zero-dependency CLI tool for syncing code snippets to markdown documentation
 * 
 * Usage: readme-sync [options]
 * Options:
 *   -f, --file <path>  Target markdown file (default: README.md)
 *   -c, --check        Dry-run validation mode
 *   -v, --version      Show version
 *   -h, --help         Show help
 */

const fs = require('fs');
const path = require('path');

const { parseArgs, showHelp, showVersion, VERSION } = require('../src/cli.js');
const { readFileSafe, writeFileAtomic } = require('../src/utils.js');
const { parseSyncBlocks, updateContent } = require('../src/parser.js');
const { discoverConfig, loadConfig, mergeOptions } = require('../src/config.js');
const { createWatcher } = require('../src/watch.js');

// Logger for verbose/silent support
class Logger {
  constructor(options) {
    this.verbose = options.verbose || false;
    this.silent = options.silent || false;
    this.prefix = '[readme-sync]';
  }

  info(msg) {
    if (!this.silent) console.log(`${this.prefix} ${msg}`);
  }

  error(msg) {
    console.error(`${this.prefix} ERROR: ${msg}`);
  }

  warn(msg) {
    if (!this.silent) console.warn(`${this.prefix} WARNING: ${msg}`);
  }

  debug(msg) {
    if (this.verbose && !this.silent) console.log(`${this.prefix} DEBUG: ${msg}`);
  }

  success(msg) {
    if (!this.silent) console.log(`${this.prefix} ✓ ${msg}`);
  }
}

/**
 * Main entry point
 * @returns {Promise<number>} - Exit code (0 for success, 1 for failure)
 */
async function main() {
  const cliOptions = parseArgs();
  const logger = new Logger({ verbose: cliOptions.verbose, silent: cliOptions.silent });

  // Handle help/version first
  if (cliOptions.help) {
    showHelp();
    return 0;
  }

  if (cliOptions.version) {
    showVersion();
    return 0;
  }

  // Check for parsing errors
  if (!cliOptions.valid) {
    logger.error(cliOptions.error);
    return 1;
  }

  logger.debug(`Starting readme-sync v${VERSION}`);

  // Resolve target file path early for config discovery
  const targetFile = path.resolve(cliOptions.file);
  const baseDir = path.dirname(targetFile);

  logger.debug(`Target file: ${targetFile}`);
  logger.debug(`Base directory: ${baseDir}`);

  // Load configuration
  let configResult;
  if (cliOptions.config) {
    logger.debug(`Loading config from: ${cliOptions.config}`);
    configResult = loadConfig(cliOptions.config, baseDir);
  } else {
    logger.debug('Discovering config file...');
    configResult = discoverConfig(baseDir);
  }

  // Merge CLI and config options (CLI takes precedence)
  const options = mergeOptions(cliOptions, configResult.config || {});
  
  if (configResult.configPath) {
    logger.debug(`Using config: ${configResult.configPath}`);
  } else {
    logger.debug('Using default configuration');
  }

  // Print config warnings
  for (const warning of configResult.warnings) {
    logger.warn(warning);
  }

  // Check if file exists
  if (!fs.existsSync(targetFile)) {
    logger.error(`File not found "${targetFile}"`);
    return 1;
  }
  logger.debug(`File exists: ${targetFile}`);

  // Read markdown content
  const content = readFileSafe(targetFile);
  if (content === null) {
    logger.error(`Unable to read "${targetFile}"`);
    return 1;
  }
  logger.debug(`Read ${content.length} characters from file`);

  // Parse sync blocks
  logger.debug('Parsing sync blocks...');
  const { blocks, errors } = parseSyncBlocks(content);
  logger.debug(`Found ${blocks.length} sync block(s)`);

  // Report syntax errors
  if (errors.length > 0) {
    for (const error of errors) {
      logger.error(`Syntax Error: ${error}`);
    }
    return 1;
  }

  // No blocks found - nothing to do
  if (blocks.length === 0) {
    logger.info(`No sync blocks found in "${path.basename(targetFile)}"`);
    return 0;
  }

  // Log each found block in verbose mode
  if (logger.verbose) {
    blocks.forEach((block, i) => {
      logger.debug(`Block ${i + 1}: ${block.filePath} (${block.startLine}-${block.endLine})`);
    });
  }

  // Define sync function for reuse (watch mode needs this)
  async function performSync() {
    // Re-read content in case it changed
    const currentContent = readFileSafe(targetFile);
    if (currentContent === null) {
      logger.error(`Unable to re-read "${targetFile}"`);
      return false;
    }

    // Re-parse blocks (line numbers may have shifted)
    const parseResult = parseSyncBlocks(currentContent);
    if (parseResult.errors.length > 0) {
      for (const error of parseResult.errors) {
        logger.error(`Syntax Error: ${error}`);
      }
      return false;
    }

    // Update content
    logger.debug('Updating content...');
    const result = updateContent(currentContent, parseResult.blocks, baseDir, options.check);

    // Print warnings
    for (const warning of result.warnings) {
      logger.warn(warning);
    }

    // Handle check mode
    if (options.check) {
      if (result.changed) {
        logger.error(`Check failed: "${path.basename(targetFile)}" has outdated sync blocks`);
        return false;
      } else {
        logger.success(`Check passed: "${path.basename(targetFile)}" is synchronized`);
        return true;
      }
    }

    // Write updated content if changed
    if (result.changed) {
      writeFileAtomic(targetFile, result.updated);
      logger.success(`Synchronized ${parseResult.blocks.length} block(s) in "${path.basename(targetFile)}"`);
    } else {
      logger.info(`"${path.basename(targetFile)}" is already synchronized`);
    }

    return true;
  }

  // Initial sync
  const initialResult = await performSync();
  if (!initialResult || options.check) {
    return initialResult ? 0 : 1;
  }

  // Watch mode
  if (options.watch) {
    logger.info('Starting watch mode...');
    logger.info('Press Ctrl+C to stop');
    
    const watcher = createWatcher(targetFile, blocks, (filePath) => {
      logger.info(`Source file changed: ${filePath}`);
      performSync().catch(err => {
        logger.error(`Sync failed: ${err.message}`);
      });
    });

    watcher.start();

    // Keep process alive
    await new Promise(() => {});
  }

  return 0;
}

// Run main and handle exit
main()
  .then(code => process.exit(code))
  .catch(err => {
    console.error(`[readme-sync] FATAL: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  });
