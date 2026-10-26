/**
 * Configuration Module
 * Loads and validates configuration from .readme-sync.json files
 * Zero dependencies - uses only native fs and path
 */

const fs = require('fs');
const path = require('path');

/**
 * Default configuration
 * @type {Object}
 */
const DEFAULT_CONFIG = {
  // Default target file
  file: 'README.md',
  // Files/patterns to ignore
  ignore: ['node_modules/**', '.git/**', '*.tmp'],
  // Custom language mappings (extension -> markdown identifier)
  languages: {},
  // Require code fences even if source file is empty
  requireFences: false,
  // Trim trailing whitespace from injected code
  trimTrailingWhitespace: true,
  // Add newline at end of file if missing
  ensureFinalNewline: true
};

/**
 * Validates configuration object
 * @param {Object} config - Configuration to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateConfig(config) {
  const errors = [];
  
  if (typeof config !== 'object' || config === null) {
    return { valid: false, errors: ['Configuration must be an object'] };
  }
  
  // Validate file
  if (config.file !== undefined && typeof config.file !== 'string') {
    errors.push('"file" must be a string');
  }
  
  // Validate ignore
  if (config.ignore !== undefined) {
    if (!Array.isArray(config.ignore)) {
      errors.push('"ignore" must be an array');
    } else {
      for (const pattern of config.ignore) {
        if (typeof pattern !== 'string') {
          errors.push('"ignore" patterns must be strings');
          break;
        }
      }
    }
  }
  
  // Validate languages
  if (config.languages !== undefined && typeof config.languages !== 'object') {
    errors.push('"languages" must be an object');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Loads configuration from file
 * @param {string} configPath - Path to config file
 * @param {string} baseDir - Base directory for relative paths
 * @returns {Object} - { config: Object|null, errors: string[] }
 */
function loadConfig(configPath, baseDir) {
  const errors = [];
  
  try {
    const absolutePath = path.isAbsolute(configPath) 
      ? configPath 
      : path.join(baseDir, configPath);
    
    if (!fs.existsSync(absolutePath)) {
      return { config: null, errors: [`Config file not found: ${configPath}`] };
    }
    
    const content = fs.readFileSync(absolutePath, 'utf-8');
    let parsed;
    
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      return { config: null, errors: [`Invalid JSON in config file: ${err.message}`] };
    }
    
    const validation = validateConfig(parsed);
    if (!validation.valid) {
      return { config: null, errors: validation.errors };
    }
    
    return { config: { ...DEFAULT_CONFIG, ...parsed }, errors: [] };
  } catch (err) {
    return { config: null, errors: [`Failed to load config: ${err.message}`] };
  }
}

/**
 * Auto-discovers configuration file in directory tree
 * Searches for .readme-sync.json from baseDir upwards
 * @param {string} baseDir - Starting directory
 * @returns {Object} - { config: Object, configPath: string|null, warnings: string[] }
 */
function discoverConfig(baseDir) {
  const configName = '.readme-sync.json';
  let currentDir = baseDir;
  const warnings = [];
  
  while (true) {
    const configPath = path.join(currentDir, configName);
    
    if (fs.existsSync(configPath)) {
      const result = loadConfig(configPath, currentDir);
      if (result.config) {
        return { 
          config: result.config, 
          configPath, 
          warnings: result.errors.length > 0 ? result.errors : [] 
        };
      }
      warnings.push(...result.errors);
    }
    
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached root
    }
    currentDir = parentDir;
  }
  
  return { config: DEFAULT_CONFIG, configPath: null, warnings };
}

/**
 * Merges CLI options with config file options
 * CLI options take precedence
 * @param {Object} cliOptions - Parsed CLI options
 * @param {Object} configOptions - Loaded config options
 * @returns {Object} - Merged options
 */
function mergeOptions(cliOptions, configOptions) {
  return {
    ...configOptions,
    ...Object.fromEntries(
      Object.entries(cliOptions).filter(([_, v]) => v !== null && v !== undefined && v !== false)
    )
  };
}

module.exports = {
  DEFAULT_CONFIG,
  validateConfig,
  loadConfig,
  discoverConfig,
  mergeOptions
};
