/**
 * Config Module Tests
 * Testing configuration loading and validation
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { 
  validateConfig, 
  loadConfig, 
  mergeOptions,
  DEFAULT_CONFIG 
} = require('../src/config.js');

console.log('\n🧪 Config Module Tests\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

// Test DEFAULT_CONFIG structure
test('DEFAULT_CONFIG has required fields', () => {
  assert.strictEqual(typeof DEFAULT_CONFIG.file, 'string');
  assert(Array.isArray(DEFAULT_CONFIG.ignore));
  assert.strictEqual(typeof DEFAULT_CONFIG.languages, 'object');
});

// Test validateConfig with valid config
test('validateConfig accepts valid config', () => {
  const result = validateConfig({
    file: 'README.md',
    ignore: ['node_modules/**']
  });
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

// Test validateConfig with invalid types
test('validateConfig rejects non-array ignore', () => {
  const result = validateConfig({
    ignore: 'node_modules'
  });
  assert.strictEqual(result.valid, false);
});

test('validateConfig rejects non-object', () => {
  const result = validateConfig('invalid');
  assert.strictEqual(result.valid, false);
});

// Test mergeOptions priority
test('mergeOptions CLI overrides config', () => {
  const cli = { file: 'CLI.md', verbose: true };
  const config = { file: 'CONFIG.md', silent: false };
  const result = mergeOptions(cli, config);
  assert.strictEqual(result.file, 'CLI.md');
  assert.strictEqual(result.silent, false);
});

test('mergeOptions keeps config values when CLI false', () => {
  const cli = { verbose: false };
  const config = { verbose: true };
  const result = mergeOptions(cli, config);
  assert.strictEqual(result.verbose, true);
});

// Test loadConfig with missing file
test('loadConfig returns error for missing file', () => {
  const result = loadConfig('nonexistent.json', __dirname);
  assert.strictEqual(result.config, null);
  assert(result.errors.length > 0);
});

console.log(`\n📊 Config Test Summary:`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Total:  ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✅ All config tests passed\n');
}
