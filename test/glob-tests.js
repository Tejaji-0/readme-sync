/**
 * Glob Module Tests
 */

const assert = require('assert');
const { globToRegex, matchesGlob, expandGlob, filterIgnored } = require('../src/glob.js');

console.log('\n🧪 Glob Module Tests\n');

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

// globToRegex tests
test('globToRegex handles asterisk', () => {
  const regex = globToRegex('*.js');
  assert(regex.test('test.js'));
  assert(regex.test('a.js'));
  assert(!regex.test('test.txt'));
});

test('globToRegex handles question mark', () => {
  const regex = globToRegex('?.js');
  assert(regex.test('a.js'));
  assert(regex.test('b.js'));
  assert(!regex.test('ab.js'));
});

test('globToRegex does not match slashes', () => {
  const regex = globToRegex('*.js');
  assert(!regex.test('src/test.js'));
});

// matchesGlob tests
test('matchesGlob with simple pattern', () => {
  assert(matchesGlob('test.js', '*.js'));
  assert(!matchesGlob('test.txt', '*.js'));
});

test('matchesGlob with slash normalization', () => {
  assert(matchesGlob('src\\test.js', 'src/test.js'));
});

// filterIgnored tests
test('filterIgnored excludes matching patterns', () => {
  const files = ['src/a.js', 'node_modules/b.js', 'dist/c.js'];
  const patterns = ['node_modules/**'];
  const result = filterIgnored(files, patterns);
  assert.deepStrictEqual(result, ['src/a.js', 'dist/c.js']);
});

test('filterIgnored passes all when no patterns', () => {
  const files = ['a.js', 'b.js'];
  const result = filterIgnored(files, []);
  assert.deepStrictEqual(result, files);
});

test('filterIgnored handles exact matches', () => {
  const files = ['ignore-me.js', 'keep.js'];
  const patterns = ['ignore-me.js'];
  const result = filterIgnored(files, patterns);
  assert.deepStrictEqual(result, ['keep.js']);
});

console.log(`\n📊 Glob Test Summary:`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);

if (failed > 0) process.exit(1);
console.log('\n✅ All glob tests passed\n');
