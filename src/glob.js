/**
 * Glob Module
 * Pattern matching for file discovery
 * Minimal implementation - no external dependencies
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert glob pattern to regex
 * Supports: * (any chars), ? (single char), ** (recursive dirs)
 * @param {string} pattern - Glob pattern
 * @returns {RegExp} - Equivalent regex
 */
function globToRegex(pattern) {
  // Escape special regex characters except glob specials
  let regex = pattern
    .replace(/\\/g, '/') // Normalize slashes
    .replace(/\*\*/g, '{{RECURSIVE}}') // Mark recursive pattern
    .replace(/\*/g, '[^/]*') // * matches anything except /
    .replace(/\?/g, '[^/]') // ? matches single char except /
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\{{RECURSIVE\}\}/g, '.*'); // ** matches anything including /

  return new RegExp(`^${regex}$`);
}

/**
 * Check if a file path matches a glob pattern
 * @param {string} filePath - File path to check
 * @param {string} pattern - Glob pattern
 * @returns {boolean}
 */
function matchesGlob(filePath, pattern) {
  const regex = globToRegex(pattern);
  return regex.test(filePath.replace(/\\/g, '/'));
}

/**
 * Expand glob patterns to file list
 * @param {string} pattern - Glob pattern like "src/{asterisk}{asterisk}/".{asterisk}js"
 * @param {string} baseDir - Base directory
 * @returns {string[]} - Matching file paths (relative to baseDir)
 */
function expandGlob(pattern, baseDir) {
  const results = [];
  const normalizedPattern = pattern.replace(/\\/g, '/');
  
  // Handle **/ recursive pattern
  if (normalizedPattern.includes('**/')) {
    const filePattern = normalizedPattern.replace('**/', '');
    const regex = globToRegex(filePattern);
    
    function traverse(dir, relativePath) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
          
          if (entry.isDirectory()) {
            // Recurse into subdirectory
            traverse(fullPath, relPath);
          } else if (entry.isFile()) {
            // Check if file matches pattern
            if (regex.test(relPath)) {
              results.push(relPath);
            }
          }
        }
      } catch (err) {
        // Permission denied or other error - skip
      }
    }
    
    traverse(baseDir, '');
  } else {
    // Non-recursive pattern
    const parts = normalizedPattern.split('/');
    const filePattern = parts.pop();
    const subDir = parts.join('/');
    const searchDir = path.join(baseDir, subDir);
    
    try {
      const entries = fs.readdirSync(searchDir, { withFileTypes: true });
      const regex = globToRegex(filePattern);
      
      for (const entry of entries) {
        if (entry.isFile() && regex.test(entry.name)) {
          results.push(subDir ? `${subDir}/${entry.name}` : entry.name);
        }
      }
    } catch (err) {
      // Directory doesn't exist or not accessible
    }
  }
  
  return results.sort();
}

/**
 * Filter files against ignore patterns
 * @param {string[]} files - Array of file paths
 * @param {string[]} ignorePatterns - Array of glob patterns to exclude
 * @returns {string[]} - Filtered file list
 */
function filterIgnored(files, ignorePatterns) {
  if (!ignorePatterns || ignorePatterns.length === 0) {
    return files;
  }
  
  return files.filter(file => {
    const normalizedFile = file.replace(/\\/g, '/');
    
    // Check against all ignore patterns
    for (const pattern of ignorePatterns) {
      const normalizedPattern = pattern.replace(/\\/g, '/');
      
      // Simple string match for exact directory ignores
      if (normalizedPattern.endsWith('/**')) {
        const dir = normalizedPattern.slice(0, -3);
        if (normalizedFile.startsWith(dir + '/')) {
          return false;
        }
      }
      
      // Glob match
      if (matchesGlob(normalizedFile, normalizedPattern)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Generate sync blocks for multiple files
 * @param {string[]} files - Array of file paths
 * @param {string} lang - Language override (optional)
 * @returns {string} - Generated markdown blocks
 */
function generateSyncBlocks(files, lang = null) {
  return files.map(file => {
    const ext = path.extname(file).slice(1);
    const language = lang || ext || 'text';
    return `<!-- sync-start: ${file} -->\n\`\`\`${language}\n\`\`\`\n<!-- sync-end: ${file} -->`;
  }).join('\n\n');
}

module.exports = {
  globToRegex,
  matchesGlob,
  expandGlob,
  filterIgnored,
  generateSyncBlocks
};
