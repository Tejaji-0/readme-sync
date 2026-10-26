/**
 * Interactive Module
 * Terminal UI for selecting sync operations
 * Zero dependencies - uses native readline
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;

/**
 * Colors for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Clear the terminal line
 */
function clearLine() {
  stdout.write('\r\x1b[K');
}

/**
 * Move cursor up
 */
function moveCursorUp(lines = 1) {
  stdout.write(`\x1b[${lines}A`);
}

/**
 * Format file size
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Interactive selection of sync blocks
 * @param {Array} blocks - Sync blocks
 * @param {string} baseDir - Base directory
 * @returns {Promise<Array>} - Selected blocks
 */
async function selectBlocks(blocks, baseDir) {
  return new Promise((resolve) => {
    const selected = new Set(blocks.map((_, i) => i));
    let cursor = 0;
    let done = false;

    console.log(`\n${colors.bright}readme-sync Interactive Mode${colors.reset}\n`);
    console.log(`${colors.dim}Use Arrow keys to navigate, Space to toggle, Enter to confirm, Esc to cancel${colors.reset}\n`);

    function render() {
      // Clear previous lines
      for (let i = 0; i < blocks.length + 4; i++) {
        moveCursorUp();
        clearLine();
      }

      blocks.forEach((block, i) => {
        const isSelected = selected.has(i);
        const isCursor = i === cursor;
        const filePath = block.filePath;
        const fullPath = path.join(baseDir, filePath);
        
        let size = 'N/A';
        try {
          const stats = fs.statSync(fullPath);
          size = formatSize(stats.size);
        } catch {}

        const checkbox = isSelected ? '☑' : '☐';
        const lineStart = isCursor ? `${colors.cyan}>${colors.reset}` : ' ';
        const fileColor = isSelected ? colors.green : colors.dim;
        
        console.log(`${lineStart} ${checkbox} ${fileColor}${filePath}${colors.reset} ${colors.dim}(${size})${colors.reset}`);
      });

      console.log(`\n${colors.dim}Selected: ${selected.size}/${blocks.length}${colors.reset}`);
    }

    function cleanup() {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', onData);
    }

    function onData(buffer) {
      const key = buffer.toString();
      const code = buffer[0];

      // Enter
      if (code === 13 || code === 10) {
        done = true;
        cleanup();
        clearLine();
        const result = blocks.filter((_, i) => selected.has(i));
        resolve(result);
        return;
      }

      // Escape or Ctrl+C
      if (code === 27 || (code === 3 && buffer.length === 1)) {
        done = true;
        cleanup();
        clearLine();
        console.log(`\n${colors.yellow}Cancelled${colors.reset}`);
        process.exit(0);
      }

      // Space
      if (code === 32) {
        if (selected.has(cursor)) {
          selected.delete(cursor);
        } else {
          selected.add(cursor);
        }
        render();
        return;
      }

      // Arrow keys (escape sequences)
      if (code === 27 && buffer[1] === 91) {
        const arrow = buffer[2];
        if (arrow === 65) cursor = Math.max(0, cursor - 1); // Up
        if (arrow === 66) cursor = Math.min(blocks.length - 1, cursor + 1); // Down
        render();
        return;
      }

      // Number keys 1-9
      if (code >= 49 && code <= 57) {
        const num = code - 49;
        if (num < blocks.length) {
          if (selected.has(num)) {
            selected.delete(num);
          } else {
            selected.add(num);
          }
          cursor = num;
          render();
        }
      }
    }

    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);

    // Initial render
    blocks.forEach(() => console.log(''));
    render();
  });
}

/**
 * Show diff between current and new content
 * @param {string} current - Current block content
 * @param {string} updated - New block content
 */
function showDiff(current, updated) {
  const currentLines = current.split('\n');
  const updatedLines = updated.split('\n');
  
  console.log(`\n${colors.bright}Changes Preview:${colors.reset}\n`);
  
  // Simple line-by-line diff
  const maxLines = Math.max(currentLines.length, updatedLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const oldLine = currentLines[i] || '';
    const newLine = updatedLines[i] || '';
    
    if (oldLine !== newLine) {
      if (oldLine) {
        console.log(`${colors.red}-${colors.reset} ${colors.dim}${oldLine.slice(0, 70)}${oldLine.length > 70 ? '...' : ''}${colors.reset}`);
      }
      if (newLine) {
        console.log(`${colors.green}+${colors.reset} ${newLine.slice(0, 70)}${newLine.length > 70 ? '...' : ''}`);
      }
    }
  }
}

/**
 * Confirm action with user
 * @param {string} message - Prompt message
 * @returns {Promise<boolean>}
 */
async function confirm(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: stdin,
      output: stdout
    });

    rl.question(`${message} [Y/n] `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() !== 'n' && answer.toLowerCase() !== 'no');
    });
  });
}

module.exports = {
  selectBlocks,
  showDiff,
  confirm,
  colors
};
