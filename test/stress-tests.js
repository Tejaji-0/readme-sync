/**
 * Stress Tests
 * Testing performance with large files
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseSyncBlocks, updateContent } = require('../src/parser.js');

const TEST_DIR = path.join(__dirname, 'stress-temp');

console.log('\n🏋️ Stress Tests\n');

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

// Test 1: Many blocks (100 blocks)
test('Handles 100 sync blocks', () => {
  let md = '# Test\n\n';
  for (let i = 0; i < 100; i++) {
    md += `<!-- sync-start: file${i}.js -->\n\`\`\`js\ncode${i}\n\`\`\`\n<!-- sync-end: file${i}.js -->\n\n`;
  }
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 100);
});

// Test 2: Large individual blocks
test('Handles large code blocks', () => {
  const largeContent = '// Line\n'.repeat(1000); // ~8KB
  const md = `<!-- sync-start: large.js -->\n\`\`\`js\n${largeContent}\n\`\`\`\n<!-- sync-end: large.js -->`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 1);
  assert(result.blocks[0].content.length > 7000);
});

// Test 3: Deeply nested content (reasonable limit)
test('Handles nested markdown structures', () => {
  let content = 'code';
  for (let i = 0; i < 50; i++) {
    content = `**${content}**`;
  }
  const md = `<!-- sync-start: nested.md -->\n\`\`\`markdown\n${content}\n\`\`\`\n<!-- sync-end: nested.md -->`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 1);
});

// Test 4: Many fake start/end tags
test('Distinguishes real tags from fakes', () => {
  const md = `
<!-- not sync-start -->
<!-- sync-start: real.js -->
\`\`\`js
real
\`\`\`
<!-- sync-end: real.js -->
<!-- sync-end: fake.js -->
<!-- sync-start: unclosed.js -->
`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 1);
  assert.strictEqual(result.blocks[0].filePath, 'real.js');
  assert(result.errors.length > 0);
});

// Cleanup
if (fs.existsSync(TEST_DIR)) {
  fs.rmSync(TEST_DIR, { recursive: true });
}

console.log(`\n📊 Stress Test Summary:`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Total:  ${passed + failed}`);

if (failed > 0) {
  console.log('\n❌ Stress tests failed\n');
  process.exit(1);
} else {
  console.log('\n✅ All stress tests passed\n');
}
