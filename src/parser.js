/**
 * Markdown Parser Module
 * Handles extraction and replacement of sync tags in markdown files
 * Zero dependencies - pure regex and string manipulation
 */

const { readFileSafe, resolveFromBase, getLanguageFromExtension, trimEmptyLines } = require('./utils.js');

/**
 * Parsed sync block structure
 * @typedef {Object} SyncBlock
 * @property {number} startLine - Line number of <!-- sync-start -->
 * @property {number} endLine - Line number of <!-- sync-end -->
 * @property {string} filePath - Target file path from tag
 * @property {string} content - Current content between tags
 * @property {boolean} hasCodeFence - Whether content is wrapped in ```
 */

// Regex to match sync-start: <!-- sync-start: path/to/file.ext -->
const SYNC_START_REGEX = /<!--\s*sync-start:\s*([^\s>]+)\s*-->/;
// Regex to match sync-end: <!-- sync-end: path/to/file.ext -->
const SYNC_END_REGEX = /<!--\s*sync-end:\s*([^\s>]+)\s*-->/;

/**
 * Parses a markdown file to find all sync blocks
 * Validates matching pairs and reports dangling tags
 * @param {string} content - Full markdown content
 * @returns {Object} - { blocks: SyncBlock[], errors: string[] }
 */
function parseSyncBlocks(content) {
  const lines = content.split('\n');
  const blocks = [];
  const errors = [];
  const openBlocks = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const startMatch = line.match(SYNC_START_REGEX);
    const endMatch = line.match(SYNC_END_REGEX);

    if (startMatch) {
      openBlocks.push({
        startLine: i + 1,
        filePath: startMatch[1],
        startIndex: i
      });
    }

    if (endMatch) {
      const filePath = endMatch[1];
      const matchingIndex = openBlocks.findIndex(b => b.filePath === filePath);
      
      if (matchingIndex === -1) {
        errors.push(`Line ${i + 1}: Dangling sync-end tag for "${filePath}" (no matching start)`);
      } else {
        const openBlock = openBlocks.splice(matchingIndex, 1)[0];
        const contentLines = lines.slice(openBlock.startIndex + 1, i);
        let blockContent = contentLines.join('\n');
        let hasCodeFence = false;

        if (contentLines.length > 0) {
          const firstLine = contentLines[0].trim();
          const lastLine = contentLines[contentLines.length - 1].trim();
          if (firstLine.startsWith('```') && lastLine === '```') {
            hasCodeFence = true;
            blockContent = contentLines.slice(1, -1).join('\n');
          }
        }

        blocks.push({
          startLine: openBlock.startLine,
          endLine: i + 1,
          filePath: filePath,
          content: blockContent,
          hasCodeFence: hasCodeFence
        });
      }
    }
  }

  for (const openBlock of openBlocks) {
    errors.push(`Line ${openBlock.startLine}: Unclosed sync-start tag for "${openBlock.filePath}" (no matching end)`);
  }

  return { blocks, errors };
}

module.exports = {
  parseSyncBlocks,
  processBlock,
  updateContent,
  SYNC_START_REGEX,
  SYNC_END_REGEX
};

/**
 * Processes a single sync block
 * @param {Object} block - The parsed block
 * @param {string} baseDir - Base directory for resolving paths
 * @returns {Object} - { success, replacement?, warning? }
 */
function processBlock(block, baseDir) {
  const absolutePath = resolveFromBase(baseDir, block.filePath);
  const sourceContent = readFileSafe(absolutePath);

  if (sourceContent === null) {
    return {
      success: false,
      warning: `Warning: Source file not found "${block.filePath}" (line ${block.startLine})`
    };
  }

  const trimmedContent = trimEmptyLines(sourceContent);
  const language = getLanguageFromExtension(block.filePath);
  const replacement = `\`\`\`${language}\n${trimmedContent}\n\`\`\``;

  return {
    success: true,
    replacement: replacement
  };
}

/**
 * Updates markdown content with processed blocks
 * @param {string} originalContent - Original markdown content
 * @param {Array} blocks - Parsed blocks
 * @param {string} baseDir - Base directory
 * @param {boolean} dryRun - If true, only check without modifying
 * @returns {Object} - { updated, changed, warnings }
 */
function updateContent(originalContent, blocks, baseDir, dryRun = false) {
  const warnings = [];
  let changed = false;
  
  // Sort blocks by startLine descending to preserve line numbers during replacement
  const sortedBlocks = [...blocks].sort((a, b) => b.startLine - a.startLine);
  let updatedContent = originalContent;

  for (const block of sortedBlocks) {
    const result = processBlock(block, baseDir);

    if (!result.success) {
      warnings.push(result.warning);
      continue;
    }

    const expectedContent = result.replacement
      .replace(/^```.*\n/, '')
      .replace(/\n```$/, '');
    const currentContent = block.content;

    if (expectedContent !== currentContent) {
      changed = true;
      
      if (!dryRun) {
        const lines = updatedContent.split('\n');
        const startIdx = block.startLine - 1;
        const endIdx = block.endLine - 1;
        
        const newBlock = [
          `<!-- sync-start: ${block.filePath} -->`,
          result.replacement,
          `<!-- sync-end: ${block.filePath} -->`
        ];

        lines.splice(startIdx, endIdx - startIdx + 1, ...newBlock);
        updatedContent = lines.join('\n');
      }
    }
  }

  return {
    updated: updatedContent,
    changed,
    warnings
  };
}

