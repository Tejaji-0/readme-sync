/**
 * Edge Case Tests
 * Testing boundary conditions and error handling
 */

const assert = require('assert');
const path = require('path');
const { parseSyncBlocks, updateContent } = require('../src/parser.js');
const { readFileSafe } = require('../src/utils.js');

console.log('\n🧪 Edge Case Tests\n');

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

// Test 1: Empty code block
test('Handles empty code blocks', () => {
  const md = `<!-- sync-start: test.js -->
\`\`\`js
\`\`\`
<!-- sync-end: test.js -->`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 1);
  assert.strictEqual(result.blocks[0].content, '');
});

// Test 2: Nested sync blocks (parser processes them sequentially)
test('Handles nested sync blocks correctly', () => {
  const md = `<!-- sync-start: outer.js -->
<!-- sync-start: inner.js -->
\`\`\`js
inner
\`\`\`
<!-- sync-end: inner.js -->
\`\`\`js
outer
\`\`\`
<!-- sync-end: outer.js -->`;
  const result = parseSyncBlocks(md);
  // Both blocks are parsed sequentially (no actual nesting)
  assert.strictEqual(result.blocks.length, 2);
  assert.strictEqual(result.blocks[0].filePath, 'inner.js');
  assert.strictEqual(result.blocks[1].filePath, 'outer.js');
});

// Test 3: File with special characters in path
test('Handles special characters in file paths', () => {
  const md = `<!-- sync-start: path/to/file-name_v2.test.js -->
\`\`\`js
code
\`\`\`
<!-- sync-end: path/to/file-name_v2.test.js -->`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 1);
  assert.strictEqual(result.blocks[0].filePath, 'path/to/file-name_v2.test.js');
});

// Test 4: Markdown without any blocks
test('Handles markdown with no sync blocks', () => {
  const md = `# Just a README\n\nSome content here.`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 0);
  assert.strictEqual(result.errors.length, 0);
});

// Test 5: Block with code fence markers inside
test('Handles code fences inside content', () => {
  const md = `<!-- sync-start: test.js -->
\`\`\`js
const x = "This has \\\`\\\`\\\` inside";
\\\`\\\`\\\`
\`\`\`
<!-- sync-end: test.js -->`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 1);
});

// Test 6: Extra whitespace in tags
test('Handles extra whitespace in tags', () => {
  const md = `<!--  sync-start:  test.js  -->
\`\`\`js
code
\`\`\`
<!--  sync-end:  test.js  -->`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 1);
  assert.strictEqual(result.blocks[0].filePath, 'test.js');
});

// Test 7: Multiple whitespace variations
test('Handles various whitespace patterns', () => {
  const variations = [
    '<!--sync-start:test.js-->',
    '<!-- sync-start:test.js -->',
    '<!--sync-start: test.js-->',
    '<!-- sync-start: test.js -->'
  ];
  
  for (const start of variations) {
    const md = `${start}
\`\`\`js
\`\`\`
<!-- sync-end: test.js -->`;
    const result = parseSyncBlocks(md);
    assert.strictEqual(result.blocks.length, 1, `Failed for: ${start}`);
  }
});

// Test 8: Unicode file paths
test('Handles unicode in file paths', () => {
  const md = `<!-- sync-start: files/文档.test.js -->
\`\`\`js
code
\`\`\`
<!-- sync-end: files/文档.test.js -->`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 1);
  assert(result.blocks[0].filePath.includes('文档'));
});

// Test 9: Very long file path
test('Handles very long file paths', () => {
  const longPath = 'a/'.repeat(50) + 'file.js';
  const md = `<!-- sync-start: ${longPath} -->
\`\`\`js
\`\`\`
<!-- sync-end: ${longPath} -->`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 1);
});

// Test 10: Comments that look like sync tags but aren't
test('Ignores non-sync comments', () => {
  const md = `<!-- This is just a regular comment -->
<!-- sync-start: real.js -->
\`\`\`js
real code
\`\`\`
<!-- sync-end: real.js -->
<!-- end of section -->`;
  const result = parseSyncBlocks(md);
  assert.strictEqual(result.blocks.length, 1);
  assert.strictEqual(result.blocks[0].filePath, 'real.js');
});

console.log(`\n📊 Edge Case Summary:`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Total:  ${passed + failed}`);

if (failed > 0) {
  console.log('\n❌ Edge case tests failed\n');
  process.exit(1);
} else {
  console.log('\n✅ All edge case tests passed\n');
}
