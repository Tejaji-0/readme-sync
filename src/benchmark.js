/**
 * Benchmark Module
 * Performance testing for readme-sync operations
 * Zero dependencies - uses native process.hrtime
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

/**
 * Timer class for high-resolution timing
 */
class Timer {
  constructor() {
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = performance.now();
    this.endTime = null;
  }

  stop() {
    this.endTime = performance.now();
    return this.elapsed();
  }

  elapsed() {
    if (!this.startTime) return 0;
    const end = this.endTime || performance.now();
    return end - this.startTime;
  }

  reset() {
    this.startTime = null;
    this.endTime = null;
  }
}

/**
 * Format milliseconds to human readable
 * @param {number} ms - Milliseconds
 * @returns {string}
 */
function formatTime(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format bytes to human readable
 * @param {number} bytes 
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

/**
 * Run benchmark on a function
 * @param {Function} fn - Function to benchmark
 * @param {number} iterations - Number of iterations
 * @returns {Object} - Benchmark results
 */
async function benchmark(fn, iterations = 100) {
  const times = [];
  const timer = new Timer();

  // Warmup
  for (let i = 0; i < 10; i++) {
    await fn();
  }

  // Actual benchmark
  for (let i = 0; i < iterations; i++) {
    timer.reset();
    timer.start();
    await fn();
    const elapsed = timer.stop();
    times.push(elapsed);
  }

  // Statistics
  const sorted = [...times].sort((a, b) => a - b);
  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  // Standard deviation
  const variance = times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);

  // Calculate ops/sec
  const opsPerSec = 1000 / avg;

  return {
    iterations,
    times,
    sum,
    avg,
    min,
    max,
    median,
    p95,
    p99,
    stdDev,
    opsPerSec
  };
}

/**
 * Run comprehensive benchmarks on readme-sync operations
 * @param {string} testDir - Directory with test files
 */
async function runBenchmarks(testDir) {
  const results = [];
  const { parseSyncBlocks, updateContent } = require('./parser.js');
  const { readFileSafe } = require('./utils.js');

  // Create test files of various sizes
  const sizes = [1, 10, 100]; // KB
  
  for (const sizeKB of sizes) {
    const sizeBytes = sizeKB * 1024;
    const testFile = path.join(testDir, `bench-${sizeKB}kb.js`);
    const mdFile = path.join(testDir, `bench-${sizeKB}kb.md`);
    
    // Generate content
    const codeContent = `// Benchmark test file\n// Size: ${sizeKB}KB\n${'// line '.repeat(Math.ceil(sizeBytes / 20))}`;
    const mdContent = `# Test\n\x3c!-- sync-start: test-${sizeKB}kb.js -->\n\`\`\`js\n\`\`\`\n\x3c!-- sync-end: test-${sizeKB}kb.js -->`;
    
    fs.writeFileSync(testFile, codeContent);
    fs.writeFileSync(mdFile, mdContent);

    // Parse benchmark
    const parseResult = await benchmark(() => {
      const content = readFileSafe(mdFile);
      return parseSyncBlocks(content);
    }, 100);

    results.push({
      name: `parse-${sizeKB}kb`,
      size: formatBytes(sizeBytes),
      ...extractStats(parseResult)
    });

    // Cleanup
    fs.unlinkSync(testFile);
    fs.unlinkSync(mdFile);
  }

  return results;
}

function extractStats(result) {
  return {
    avg: formatTime(result.avg),
    min: formatTime(result.min),
    max: formatTime(result.max),
    p95: formatTime(result.p95),
    opsPerSec: result.opsPerSec.toFixed(2)
  };
}

/**
 * Print benchmark results as table
 * @param {Array} results 
 */
function printResults(results) {
  console.log('\n' + '='.repeat(80));
  console.log('Performance Benchmark Results');
  console.log('='.repeat(80));
  
  console.log(`\n${'Operation'.padEnd(20)} ${'Size'.padEnd(10)} ${'Avg'.padEnd(12)} ${'Min'.padEnd(12)} ${'P95'.padEnd(12)} ${'Ops/sec'.padEnd(12)}`);
  console.log('-'.repeat(80));
  
  for (const r of results) {
    console.log(
      `${r.name.padEnd(20)} ` +
      `${r.size.padEnd(10)} ` +
      `${r.avg.padEnd(12)} ` +
      `${r.min.padEnd(12)} ` +
      `${r.p95.padEnd(12)} ` +
      `${r.opsPerSec.padEnd(12)}`
    );
  }
  
  console.log('='.repeat(80) + '\n');
}

module.exports = {
  Timer,
  benchmark,
  runBenchmarks,
  printResults,
  formatTime,
  formatBytes
};