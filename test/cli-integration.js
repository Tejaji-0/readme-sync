const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_DIR = path.join(__dirname, 'cli-temp');
const CLI_PATH = path.join(__dirname, '..', 'bin', 'readme-sync.js');

console.log('\n🔧 CLI Integration Tests\n');

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

// Setup
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

// Test 1: Basic sync execution
test('CLI executes successfully', () => {
  const sourceFile = path.join(TEST_DIR, 'test.js');
  const mdFile = path.join(TEST_DIR, 'test.md');
  
  fs.writeFileSync(sourceFile, '// Test\nconst x = 1;');
  fs.writeFileSync(mdFile, `# Test\n\n<!-- sync-start: test.js -->\n\`\`\`js\n\`\`\`\n<!-- sync-end: test.js -->`);
  
  const result = execSync(`node "${CLI_PATH}" -f "${mdFile}"`, { encoding: 'utf-8' });
  // Accept various sync messages
  assert(/synchroniz|already/i.test(result), `Output was: "${result}"`);
});

// Test 2: Check mode returns proper exit code
test('Check mode exits 0 when synced', () => {
  const sourceFile = path.join(TEST_DIR, 'synced.js');
  const mdFile = path.join(TEST_DIR, 'synced.md');
  
  fs.writeFileSync(sourceFile, 'const synced = true;');
  fs.writeFileSync(mdFile, `# Synced\n\n<!-- sync-start: synced.js -->\n\`\`\`js\nconst synced = true;\n\`\`\`\n<!-- sync-end: synced.js -->`);
  
  try {
    execSync(`node "${CLI_PATH}" -f "${mdFile}" -c --silent`);
    // If we get here, exit code was 0
  } catch (err) {
    // Should not throw for synced file
    throw new Error('Expected exit code 0');
  }
});

// Test 3: Version flag
test('Version flag outputs version', () => {
  const result = execSync(`node "${CLI_PATH}" -v`, { encoding: 'utf-8' });
  assert(result.includes('1.0.0'));
});

// Test 4: Help flag
test('Help flag outputs usage', () => {
  const result = execSync(`node "${CLI_PATH}" -h`, { encoding: 'utf-8' });
  assert(result.includes('Usage:'));
  assert(result.includes('Options:'));
});

// Test 5: File not found error
test('Returns error for missing file', () => {
  const missingFile = path.join(TEST_DIR, 'nonexistent.md');
  try {
    execSync(`node "${CLI_PATH}" -f "${missingFile}" --silent`);
    throw new Error('Should have failed');
  } catch (err) {
    assert(err.status !== 0, 'Expected non-zero exit code');
  }
});

// Cleanup
if (fs.existsSync(TEST_DIR)) {
  fs.rmSync(TEST_DIR, { recursive: true });
}

console.log(`\n📊 CLI Integration Summary:`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Total:  ${passed + failed}`);

if (failed > 0) {
  console.log('\n❌ CLI integration tests failed\n');
  process.exit(1);
} else {
  console.log('\n✅ All CLI integration tests passed\n');
}
