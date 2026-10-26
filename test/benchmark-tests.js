/**
 * Benchmark Module Tests
 */

const assert = require('assert');
const { Timer, benchmark, formatTime, formatBytes } = require('../src/benchmark.js');

console.log('\n🏁 Benchmark Module Tests\n');

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

// Timer tests
test('Timer measures elapsed time', () => {
  const timer = new Timer();
  timer.start();
  const startTime = Date.now();
  while (Date.now() - startTime < 10) {} // Wait ~10ms
  const elapsed = timer.stop();
  assert(elapsed >= 0, 'Elapsed should be >= 0');
  assert(elapsed < 100, 'Elapsed should be reasonably small');
});

test('Timer reset clears time', () => {
  const timer = new Timer();
  timer.start();
  timer.reset();
  assert.strictEqual(timer.elapsed(), 0);
});

// formatTime tests
test('formatTime shows microseconds', () => {
  const result = formatTime(0.5);
  assert(result.includes('μs'));
});

test('formatTime shows milliseconds', () => {
  const result = formatTime(50);
  assert(result.includes('ms'));
});

test('formatTime shows seconds', () => {
  const result = formatTime(1500);
  assert(result.includes('s'));
});

// formatBytes tests
test('formatBytes shows bytes', () => {
  assert.strictEqual(formatBytes(500), '500B');
});

test('formatBytes shows KB', () => {
  const result = formatBytes(2048);
  assert(result.includes('KB'));
});

test('formatBytes shows MB', () => {
  const result = formatBytes(2 * 1024 * 1024);
  assert(result.includes('MB'));
});

// benchmark function tests
test('benchmark runs function multiple times', async () => {
  let count = 0;
  const result = await benchmark(() => { count++; }, 10);
  assert.strictEqual(result.iterations, 10);
  assert.strictEqual(count, 10 + 10); // warmup + actual
});

test('benchmark calculates statistics', async () => {
  const result = await benchmark(() => {}, 10);
  assert(typeof result.avg === 'number');
  assert(typeof result.min === 'number');
  assert(typeof result.max === 'number');
  assert(result.opsPerSec > 0);
});

console.log(`\n📊 Benchmark Test Summary:`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);

if (failed > 0) process.exit(1);
console.log('\n✅ All benchmark tests passed\n');
