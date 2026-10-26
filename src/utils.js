/**
 * File System Utilities Module
 * Provides atomic file operations and safe I/O handling
 * Zero dependencies - uses only native Node.js modules
 */

const fs = require('fs');
const path = require('path');

/**
 * Reads a file synchronously with error handling
 * Returns null if file doesn't exist, throws on other errors
 * @param {string} filePath - Absolute or relative path to file
 * @returns {string|null} - File contents or null if not found
 */
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

/**
 * Writes file atomically using a temp file and rename
 * Prevents corruption if process is interrupted
 * @param {string} filePath - Target file path
 * @param {string} content - Content to write
 */
function writeFileAtomic(filePath, content) {
  const dir = path.dirname(filePath);
  const tempFile = path.join(dir, `.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  
  try {
    // Write to temp file first
    fs.writeFileSync(tempFile, content, 'utf-8');
    // Atomic rename operation
    fs.renameSync(tempFile, filePath);
  } catch (err) {
    // Cleanup temp file on error
    try {
      fs.unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
    throw err;
  }
}

/**
 * Resolves a relative path from a base directory
 * @param {string} baseDir - Base directory path
 * @param {string} relativePath - Relative path to resolve
 * @returns {string} - Absolute resolved path
 */
function resolveFromBase(baseDir, relativePath) {
  // Normalize path separators for cross-platform compatibility
  const normalized = relativePath.replace(/\\/g, '/');
  return path.resolve(baseDir, normalized);
}

/**
 * Maps file extension to markdown code fence language
 * @param {string} filePath - Path to source file
 * @returns {string} - Language identifier for markdown
 */
function getLanguageFromExtension(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mapping = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.py': 'python',
    '.rb': 'ruby',
    '.sh': 'bash',
    '.bash': 'bash',
    '.zsh': 'zsh',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.xml': 'xml',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.less': 'less',
    '.go': 'go',
    '.rs': 'rust',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.h': 'c',
    '.hpp': 'cpp',
    '.cs': 'csharp',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.r': 'r',
    '.m': 'matlab',
    '.pl': 'perl',
    '.lua': 'lua',
    '.vim': 'vim',
    '.md': 'markdown',
    '.dockerfile': 'dockerfile',
    '.makefile': 'makefile',
    '.cmake': 'cmake',
    // Additional languages
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    '.jsx': 'jsx',
    '.tsx': 'tsx',
    '.vue': 'vue',
    '.svelte': 'svelte',
    '.elm': 'elm',
    '.clj': 'clojure',
    '.ex': 'elixir',
    '.exs': 'elixir',
    '.erl': 'erlang',
    '.hrl': 'erlang',
    '.fs': 'fsharp',
    '.fsx': 'fsharp',
    '.gd': 'gdscript',
    '.hs': 'haskell',
    '.lhs': 'haskell',
    '.jl': 'julia',
    '.nim': 'nim',
    '.ml': 'ocaml',
    '.mli': 'ocaml',
    '.pas': 'pascal',
    '.pp': 'pascal',
    '.ps1': 'powershell',
    '.psm1': 'powershell',
    '.psd1': 'powershell',
    '.raku': 'raku',
    '.rb': 'ruby',
    '.erb': 'erb',
    '.haml': 'haml',
    '.slim': 'slim',
    '.sol': 'solidity',
    '.vy': 'vyper',
    '.v': 'vlang',
    '.zig': 'zig',
    '.d': 'd',
    '.f90': 'fortran',
    '.f95': 'fortran',
    '.cr': 'crystal',
    '.coffee': 'coffeescript',
    '.litcoffee': 'coffeescript',
    '.dart': 'dart',
    '.groovy': 'groovy',
    '.grt': 'groovy',
    '.gradle': 'groovy',
    '.pde': 'processing',
    '.styl': 'stylus',
    '.postcss': 'postcss',
    '.pcss': 'postcss',
    '.sss': 'sugarss',
    '.graphql': 'graphql',
    '.gql': 'graphql',
    '.toml': 'toml',
    '.ini': 'ini',
    '.cfg': 'ini',
    '.properties': 'properties',
    '.env': 'dotenv',
    '.editorconfig': 'editorconfig',
    '.gitignore': 'ignore',
    '.gitattributes': 'gitattributes',
    '.dockerignore': 'ignore'
  };
  return mapping[ext] || ext.slice(1) || 'text';
}

/**
 * Trims leading/trailing empty lines from content
 * @param {string} content - Raw file content
 * @returns {string} - Trimmed content
 */
function trimEmptyLines(content) {
  return content.replace(/^\n+/, '').replace(/\n+$/, '');
}

module.exports = {
  readFileSafe,
  writeFileAtomic,
  resolveFromBase,
  getLanguageFromExtension,
  trimEmptyLines
};
