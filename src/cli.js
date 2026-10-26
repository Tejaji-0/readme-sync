/**
 * CLI Module
 * Command-line argument parsing and flag handling
 * Zero dependencies - uses only process.argv
 */

const path = require('path');

/**
 * CLI options structure
 * @typedef {Object} CliOptions
 * @property {string} file - Target markdown file path
 * @property {boolean} check - Dry-run check mode
 * @property {boolean} version - Show version flag
 * @property {boolean} help - Show help flag
 * @property {boolean} valid - Whether parsing succeeded
 * @property {string|null} error - Error message if invalid
 */

const VERSION = '1.0.0';

const HELP_TEXT = `
readme-sync - A zero-dependency CLI tool for syncing code snippets to README

Usage: readme-sync [options]

Options:
  -f, --file <path>    Target markdown file (default: README.md)
  -c, --check          Dry-run validation mode (CI/CD)
                       Exit code 0 if synced, 1 if outdated
  --verbose            Enable verbose output with detailed logging
  --silent             Suppress all output except errors
  --config <path>      Use custom configuration file
  -w, --watch          Watch source files for changes and auto-sync
  -i, --interactive    Interactive mode - select which blocks to sync
  -v, --version        Show version number
  -h, --help           Show this help message

Examples:
  readme-sync                              Sync README.md
  readme-sync -f docs/API.md               Sync docs/API.md
  readme-sync -c                           Check if README.md is up to date
  readme-sync --file ./guides/setup.md     Sync specific file
  readme-sync --verbose -f README.md       Sync with detailed output

Configuration:
  Create a .readme-sync.json file for persistent settings.

Documentation:
  https://github.com/your-org/readme-sync
`;

/**
 * Parse command-line arguments
 * @returns {CliOptions}
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    file: 'README.md',
    check: false,
    watch: false,
    interactive: false,
    verbose: false,
    silent: false,
    config: null,
    version: false,
    help: false,
    valid: true,
    error: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Help flags
    if (arg === '-h' || arg === '--help') {
      options.help = true;
      return options;
    }

    // Version flags
    if (arg === '-v' || arg === '--version') {
      options.version = true;
      return options;
    }

    // Check mode
    if (arg === '-c' || arg === '--check') {
      options.check = true;
      continue;
    }

    // Watch mode
    if (arg === '-w' || arg === '--watch') {
      options.watch = true;
      continue;
    }

    // Interactive mode
    if (arg === '-i' || arg === '--interactive') {
      options.interactive = true;
      continue;
    }

    // Verbose mode
    if (arg === '--verbose') {
      options.verbose = true;
      continue;
    }

    // Silent mode
    if (arg === '--silent') {
      options.silent = true;
      continue;
    }

    // Config file option
    if (arg === '--config') {
      const nextArg = args[i + 1];
      if (!nextArg || nextArg.startsWith('-')) {
        options.valid = false;
        options.error = `Error: Option ${arg} requires a config file path argument`;
        return options;
      }
      options.config = path.resolve(nextArg);
      i++;
      continue;
    }

    // File option
    if (arg === '-f' || arg === '--file') {
      const nextArg = args[i + 1];
      if (!nextArg || nextArg.startsWith('-')) {
        options.valid = false;
        options.error = `Error: Option ${arg} requires a file path argument`;
        return options;
      }
      options.file = path.resolve(nextArg);
      i++; // Skip next argument
      continue;
    }

    // Unknown option
    if (arg.startsWith('-')) {
      options.valid = false;
      options.error = `Error: Unknown option "${arg}". Use -h for help.`;
      return options;
    }
  }

  return options;
}

/**
 * Show help text
 */
function showHelp() {
  console.log(HELP_TEXT.trim());
}

/**
 * Show version
 */
function showVersion() {
  console.log(`readme-sync v${VERSION}`);
}

module.exports = {
  parseArgs,
  showHelp,
  showVersion,
  VERSION,
  HELP_TEXT
};
