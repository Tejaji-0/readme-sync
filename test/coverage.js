/**
 * Test Coverage Reporter
 * Manual coverage tracking for zero-dependency project
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const TEST_DIR = path.join(__dirname);

/**
 * Extract function names from source
 */
function extractFunctions(content) {
  const functions = [];
  const fnRegex = /(?:function|const|let|var)\s+(\w+)\s*[=:\s]*(?:async\s+)?function|\bfunction\s+(\w+)|(?:async\s+)?(.*?)\s*=>/g;
  let match;
  while ((match = fnRegex.exec(content)) !== null) {
    const name = match[1] || match[2];
    if (name && !name.startsWith('_')) {
      functions.push(name);
    }
  }
  return [...new Set(functions)].sort();
}

/**
 * Check if function is tested
 */
function isTested(functionName, testContent) {
  const patterns = [
    new RegExp(`\\b${functionName}\\b`),
    new RegExp(`test\\s*\\([^)]*${functionName}`, 'i'),
    new RegExp(`'[^']*${functionName}[^']*'`, 'i'),
    new RegExp(`"[^"]*${functionName}[^"]*"`, 'i')
  ];
  return patterns.some(p => p.test(testContent));
}

function generateCoverage() {
  const srcFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.js'));
  const testFiles = fs.readdirSync(TEST_DIR).filter(f => f.endsWith('.js'));
  
  const allTestContent = testFiles.map(f => 
    fs.readFileSync(path.join(TEST_DIR, f), 'utf-8')
  ).join('\n');

  console.log('\n' + '='.repeat(70));
  console.log('  Test Coverage Report');
  console.log('='.repeat(70));

  let totalFunctions = 0;
  let testedFunctions = 0;

  for (const file of srcFiles) {
    const content = fs.readFileSync(path.join(SRC_DIR, file), 'utf-8');
    const functions = extractFunctions(content);
    
    if (functions.length === 0) continue;
    
    console.log(`\n📄 ${file}:`);
    
    for (const fn of functions) {
      totalFunctions++;
      const tested = isTested(fn, allTestContent);
      if (tested) testedFunctions++;
      
      const status = tested ? '✓' : '○';
      console.log(`  ${status} ${fn}`);
    }
  }

  const coverage = totalFunctions > 0 
    ? ((testedFunctions / totalFunctions) * 100).toFixed(1)
    : 0;

  console.log('\n' + '-'.repeat(70));
  console.log(`  Coverage: ${testedFunctions}/${totalFunctions} functions (${coverage}%)`);
  console.log('='.repeat(70) + '\n');

  return { testedFunctions, totalFunctions, coverage };
}

// Run coverage
if (require.main === module) {
  const results = generateCoverage();
  process.exit(results.coverage < 50 ? 1 : 0);
}

module.exports = { generateCoverage };
