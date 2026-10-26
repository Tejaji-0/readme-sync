/**
 * Documentation Generator
 * Generates comprehensive documentation from source code
 * Run: node scripts/generate-docs.js
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const OUT_DIR = path.join(__dirname, '..', 'docs');

/**
 * Extract JSDoc comments from source file
 * @param {string} filePath 
 * @returns {Array}
 */
function extractJSDoc(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const docs = [];
  
  // Match JSDoc blocks
  const regex = /\/\*\*[\s\S]*?\*\//g;
  const matches = content.match(regex) || [];
  
  for (const match of matches) {
    const lines = match.split('\n')
      .map(line => line.replace(/^\s*\*\s?/, '').trim())
      .filter(line => line && !line.startsWith('/*'));
    
    const doc = {
      description: '',
      params: [],
      returns: null,
      type: null
    };
    
    for (const line of lines) {
      if (line.startsWith('@param')) {
        const paramMatch = line.match(/@param\s+\{([^}]+)\}\s+(\w+)\s*-?\s*(.*)/);
        if (paramMatch) {
          doc.params.push({
            type: paramMatch[1],
            name: paramMatch[2],
            description: paramMatch[3] || ''
          });
        }
      } else if (line.startsWith('@returns')) {
        const returnsMatch = line.match(/@returns\s+\{([^}]+)\}\s*(.*)/);
        if (returnsMatch) {
          doc.returns = {
            type: returnsMatch[1],
            description: returnsMatch[2] || ''
          };
        }
      } else if (line.startsWith('@typedef')) {
        doc.type = 'typedef';
      } else {
        doc.description += line + ' ';
      }
    }
    
    doc.description = doc.description.trim();
    if (doc.description || doc.params.length > 0) {
      docs.push(doc);
    }
  }
  
  return docs;
}

/**
 * Generate API documentation
 */
function generateAPIDocs() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const modules = [];
  const srcFiles = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.js'));
  
  for (const file of srcFiles) {
    const filePath = path.join(SRC_DIR, file);
    const docs = extractJSDoc(filePath);
    
    if (docs.length > 0) {
      modules.push({
        name: file.replace('.js', ''),
        docs
      });
    }
  }

  // Generate markdown
  let md = '# API Documentation\n\n';
  md += '> Auto-generated from JSDoc comments\n\n';
  
  for (const mod of modules) {
    md += `## ${mod.name}.js\n\n`;
    
    for (const doc of mod.docs) {
      if (doc.description) {
        md += `${doc.description}\n\n`;
      }
      
      if (doc.params.length > 0) {
        md += '**Parameters:**\n\n';
        md += '| Name | Type | Description |\n';
        md += '|------|------|-------------|\n';
        for (const p of doc.params) {
          md += `| ${p.name} | \`${p.type}\` | ${p.description} |\n`;
        }
        md += '\n';
      }
      
      if (doc.returns) {
        md += `**Returns:** \`${doc.returns.type}\` - ${doc.returns.description}\n\n`;
      }
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'API.md'), md);
  console.log(`Generated API docs: ${modules.length} modules documented`);
}

/**
 * Generate README table of contents
 */
function generateTOC() {
  const readmePath = path.join(__dirname, '..', 'README.md');
  let content = fs.readFileSync(readmePath, 'utf-8');
  
  const headings = [];
  const regex = /^##\s+(.+)$/gm;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    headings.push(match[1]);
  }

  let toc = '## Table of Contents\n\n';
  for (const heading of headings) {
    const anchor = heading.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    toc += `- [${heading}](#${anchor})\n`;
  }

  console.log('Generated Table of Contents');
}

// Main
generateAPIDocs();
generateTOC();

console.log('\n✅ Documentation generation complete');
