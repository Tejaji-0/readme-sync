#!/usr/bin/env node

/**
 * Standalone benchmark runner
 * Run: node scripts/benchmark.js
 */

const path = require('path');
const fs = require('fs');
const { runBenchmarks, printResults } = require('../src/benchmark.js');

const TEST_DIR = path.join(__dirname, '..', 'test', 'bench-temp');

async function main() {
  // Ensure test directory exists
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }

  console.log('\n📊 Running Performance Benchmarks\n');
  console.log('Testing parse performance with various file sizes...\n');

  try {
    const results = await runBenchmarks(TEST_DIR);
    printResults(results);
  } catch (err) {
    console.error('Benchmark failed:', err.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
  }
}

main();
