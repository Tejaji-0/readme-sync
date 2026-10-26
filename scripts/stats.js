const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function getStats() {
  let totalFiles = 0;
  let totalLines = 0;
  let totalBytes = 0;
  const fileTypes = {};

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.name === '.git') continue;
      if (entry.name === 'node_modules') continue;
      
      if (entry.isDirectory()) {
        scan(fullPath);
      } else {
        totalFiles++;
        const ext = path.extname(entry.name) || 'no-ext';
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').length;
        const bytes = fs.statSync(fullPath).size;
        
        totalLines += lines;
        totalBytes += bytes;
        
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }
    }
  }

  scan(ROOT);

  return {
    totalFiles,
    totalLines,
    totalBytes,
    fileTypes
  };
}

const stats = getStats();

console.log('\n' + '='.repeat(60));
console.log('  readme-sync Project Statistics');
console.log('='.repeat(60));
console.log(`\n  Total Files:  ${stats.totalFiles}`);
console.log(`  Total Lines:  ${stats.totalLines.toLocaleString()}`);
console.log(`  Total Size:   ${(stats.totalBytes / 1024).toFixed(2)} KB`);
console.log(`\n  File Types:`);
Object.entries(stats.fileTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([ext, count]) => {
    console.log(`    ${ext.padEnd(10)} ${count.toString().padStart(3)} files`);
  });

console.log('\n' + '='.repeat(60) + '\n');
