/**
 * Plugin Module Tests
 */

const assert = require('assert');
const { registerHook, executeHook, HOOKS } = require('../src/plugins.js');

console.log('\n🧪 Plugin Module Tests\n');

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

// Clear hooks before tests
const originalHooks = new Map(global.hooks || []);

// Test HOOKS constants
test('HOOKS defines standard hooks', () => {
  assert.strictEqual(typeof HOOKS.PRE_PARSE, 'string');
  assert.strictEqual(typeof HOOKS.POST_PARSE, 'string');
  assert.strictEqual(typeof HOOKS.PRE_WRITE, 'string');
  assert.strictEqual(typeof HOOKS.POST_WRITE, 'string');
});

// Test registerHook and executeHook
test('registerHook adds function to hook', async () => {
  let called = false;
  registerHook('test:hook', () => { called = true; return 'result'; });
  await executeHook('test:hook', 'data');
  assert.strictEqual(called, true);
});

test('executeHook transforms data', async () => {
  registerHook('test:transform', (data) => data + ' modified');
  const result = await executeHook('test:transform', 'original');
  assert.strictEqual(result, 'original modified');
});

test('executeHook chains multiple hooks', async () => {
  registerHook('test:chain', (d) => d + '1', 20); // Higher priority (runs first)
  registerHook('test:chain', (d) => d + '2', 10);
  const result = await executeHook('test:chain', 'start');
  assert.strictEqual(result, 'start12');
});

test('executeHook returns data if no hooks', async () => {
  const result = await executeHook('test:empty', 'unchanged');
  assert.strictEqual(result, 'unchanged');
});

console.log(`\n📊 Plugin Test Summary:`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);

if (failed > 0) process.exit(1);
console.log('\n✅ All plugin tests passed\n');
