/**
 * Example Plugin: Line Numbers
 * Adds line numbers to code blocks
 * 
 * Usage in config:
 * {
 *   "plugins": ["./plugins/line-numbers.js"]
 * }
 */

const { registerHook, HOOKS } = require('../src/plugins.js');

// Register post-update hook to add line numbers
registerHook(HOOKS.POST_UPDATE, (content) => {
  // Add line numbers to code blocks
  return content.replace(
    /```(\w+)\n([\s\S]*?)```/g,
    (match, lang, code) => {
      const lines = code.split('\n').map((line, i) => {
        return `${(i + 1).toString().padStart(3)} | ${line}`;
      });
      return `\`\`\`${lang}\n${lines.join('\n')}\n\`\`\``;
    }
  );
});

console.log('[plugin] Line numbers plugin loaded');
