/**
 * Watch Module
 * File system watching for live README synchronization
 * Zero dependencies - uses native fs.watch (with fs.watchFile fallback)
 */

const fs = require('fs');
const path = require('path');

/**
 * Creates a watcher for source files referenced in sync blocks
 * @param {string} mdFile - Path to markdown file
 * @param {Array} blocks - Parsed sync blocks
 * @param {Function} onChange - Callback when source files change
 * @returns {Object} - { start(), stop(), isWatching() }
 */
function createWatcher(mdFile, blocks, onChange) {
  const watchers = new Map();
  const baseDir = path.dirname(mdFile);
  let isRunning = false;

  /**
   * Debounce function to prevent rapid-fire updates
   */
  function debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Watch a single source file
   */
  function watchFile(filePath) {
    if (watchers.has(filePath)) return;

    const absolutePath = path.join(baseDir, filePath);
    
    // Check if file exists before watching
    if (!fs.existsSync(absolutePath)) {
      console.warn(`[watch] File not found, skipping watch: ${filePath}`);
      return;
    }

    let watcher;
    
    try {
      // Try native fs.watch first (efficient on most platforms)
      watcher = fs.watch(absolutePath, (eventType) => {
        if (eventType === 'change') {
          debouncedOnChange(filePath, eventType);
        }
      });
    } catch (err) {
      // Fallback to fs.watchFile for edge cases (network drives, etc.)
      console.warn(`[watch] fs.watch failed for ${filePath}, using fallback: ${err.message}`);
      fs.watchFile(absolutePath, { interval: 500 }, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          debouncedOnChange(filePath, 'change');
        }
      });
      watcher = { 
        close: () => fs.unwatchFile(absolutePath) 
      };
    }

    watchers.set(filePath, watcher);
    console.log(`[watch] Now watching: ${filePath}`);
  }

  const debouncedOnChange = debounce((filePath, eventType) => {
    console.log(`[watch] Detected change in: ${filePath}`);
    onChange(filePath, eventType);
  });

  return {
    start() {
      if (isRunning) return;
      isRunning = true;
      
      console.log(`[watch] Starting watcher for ${blocks.length} source file(s)...`);
      
      blocks.forEach(block => {
        watchFile(block.filePath);
      });
    },

    stop() {
      if (!isRunning) return;
      isRunning = false;

      console.log('[watch] Stopping all watchers...');
      watchers.forEach((watcher, filePath) => {
        try {
          watcher.close();
        } catch (err) {
          console.warn(`[watch] Error stopping watcher for ${filePath}: ${err.message}`);
        }
      });
      watchers.clear();
    },

    isWatching() {
      return isRunning;
    },

    // Add a new file to watch (useful for dynamically discovered blocks)
    add(filePath) {
      if (!isRunning) return;
      watchFile(filePath);
    }
  };
}

module.exports = {
  createWatcher
};