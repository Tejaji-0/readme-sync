/**
 * Test Suite for readme-sync
 * Simple test runner - no external dependencies
 */

const fs = require('fs');
const path = require('path');

const { readFileSafe, writeFileAtomic, trimEmptyLines, getLanguageFromExtension } = require('../src/utils.js');
const { parseSyncBlocks, updateContent } = require('../src/parser.js');
const { parseArgs } = require('../src/cli.js');

// Test results tracking
let passed = 0;
let failed = 0;

/**
 * Simple assertion helper
 */
function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n🧪 Running readme-sync test suite\n');

  // ===== Utils Tests =====
  console.log('Utils Module Tests:');
  
  // Test getLanguageFromExtension
  assert(getLanguageFromExtension('test.js') === 'javascript', 'Maps .js to javascript');
  assert(getLanguageFromExtension('test.py') === 'python', 'Maps .py to python');
  assert(getLanguageFromExtension('app.rs') === 'rust', 'Maps .rs to rust');
  assert(getLanguageFromExtension('Makefile') === 'text', 'Handles files without extension');
  
  // Test trimEmptyLines
  assert(trimEmptyLines('\n\nhello\n\n') === 'hello', 'Trims empty lines');
  assert(trimEmptyLines('hello') === 'hello', 'Preserves clean content');
  
  // ===== Parser Tests =====
  console.log('\nParser Module Tests:');
  
  // Test parseSyncBlocks - valid block
  const validMd = `<!-- sync-start: test.js -->
\`\`\`js
old content
\`\`\`
<!-- sync-end: test.js -->`;
  
  const validResult = parseSyncBlocks(validMd);
  assert(validResult.blocks.length === 1, 'Parses single valid block');
  assert(validResult.errors.length === 0, 'No errors for valid block');
  assert(validResult.blocks[0].filePath === 'test.js', 'Extracts file path correctly');
  assert(validResult.blocks[0].startLine === 1, 'Correct start line');
  assert(validResult.blocks[0].endLine === 5, 'Correct end line');
  
  // Test parseSyncBlocks - dangling end tag
  const danglingEnd = `Content
<!-- sync-end: missing.js -->
More content`;
  
  const danglingResult = parseSyncBlocks(danglingEnd);
  assert(danglingResult.blocks.length === 0, 'No blocks for dangling end');
  assert(danglingResult.errors.length === 1, 'Reports dangling end error');
  assert(danglingResult.errors[0].includes('Line 2'), 'Error includes line number');
  
  // Test parseSyncBlocks - unclosed start tag
  const unclosedStart = `<!-- sync-start: unclosed.js -->
Content here`;
  
  const unclosedResult = parseSyncBlocks(unclosedStart);
  assert(unclosedResult.blocks.length === 0, 'No blocks for unclosed start');
  assert(unclosedResult.errors.length === 1, 'Reports unclosed start error');
  
  // Test parseSyncBlocks - multiple blocks
  const multiMd = `<!-- sync-start: a.js -->
\`\`\`js
a
\`\`\`
<!-- sync-end: a.js -->

<!-- sync-start: b.py -->
\`\`\`python
b
\`\`\`
<!-- sync-end: b.py -->`;
  
  const multiResult = parseSyncBlocks(multiMd);
  assert(multiResult.blocks.length === 2, 'Parses multiple blocks');
  assert(multiResult.blocks[0].filePath === 'a.js', 'First block path correct');
  assert(multiResult.blocks[1].filePath === 'b.py', 'Second block path correct');
  
  // ===== CLI Tests =====
  console.log('\nCLI Module Tests:');
  
  // Save original argv
  const originalArgv = process.argv;
  
  // Test default options
  process.argv = ['node', 'readme-sync'];
  let options = parseArgs();
  assert(options.valid === true, 'Default options are valid');
  assert(options.file === 'README.md', 'Default file is README.md');
  assert(options.check === false, 'Default check is false');
  
  // Test check flag
  process.argv = ['node', 'readme-sync', '-c'];
  options = parseArgs();
  assert(options.check === true, 'Parses -c flag');
  
  // Test file flag
  process.argv = ['node', 'readme-sync', '-f', 'docs/API.md'];
  options = parseArgs();
  assert(options.file.includes('docs') && options.file.includes('API.md'), 'Parses -f flag with path');
  
  // Test help flag
  process.argv = ['node', 'readme-sync', '-h'];
  options = parseArgs();
  assert(options.help === true, 'Parses -h flag');
  
  // Test verbose flag
  process.argv = ['node', 'readme-sync', '--verbose'];
  options = parseArgs();
  assert(options.verbose === true, 'Parses --verbose flag');
  
  // Test silent flag
  process.argv = ['node', 'readme-sync', '--silent'];
  options = parseArgs();
  assert(options.silent === true, 'Parses --silent flag');
  
  // Test watch flag
  process.argv = ['node', 'readme-sync', '-w'];
  options = parseArgs();
  assert(options.watch === true, 'Parses -w flag');
  
  process.argv = ['node', 'readme-sync', '--watch'];
  options = parseArgs();
  assert(options.watch === true, 'Parses --watch flag');
  
  process.argv = originalArgv;
  
  // ===== Integration Tests =====
  console.log('\nIntegration Tests:');
  
  // Create temp test files
  const testDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  const sourceFile = path.join(testDir, 'source.js');
  const mdFile = path.join(testDir, 'test.md');
  
  fs.writeFileSync(sourceFile, '// Test source\nfunction test() {\n  return 42;\n}');
  fs.writeFileSync(mdFile, String.raw`<!-- sync-start: source.js -->
\`\`\`js
placeholder
\`\`\`
<!-- sync-end: source.js -->`);
  
  // Read and parse
  const mdContent = readFileSafe(mdFile);
  const { blocks, errors } = parseSyncBlocks(mdContent);
  assert(errors.length === 0, 'Integration: no parse errors');
  assert(blocks.length === 1, 'Integration: parsed one block');
  
  // Update content
  const result = updateContent(mdContent, blocks, testDir, false);
  assert(result.warnings.length === 0, 'Integration: file found, no warnings');
  assert(result.changed === true, 'Integration: content was updated');
  assert(result.updated.includes('return 42'), 'Integration: source injected');
  
  // Cleanup
  fs.unlinkSync(sourceFile);
  fs.unlinkSync(mdFile);
  fs.rmdirSync(testDir);
  
  // ===== Summary =====
  console.log('\n📊 Test Summary:');
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total:  ${passed + failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Test suite failed\n');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed\n');
    process.exit(0);
  }
}

runTests();
