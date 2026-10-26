/**
 * Plugin Module
 * Hook system for extensibility
 * Zero dependencies
 */

const hooks = new Map();

/**
 * Register a hook
 * @param {string} name - Hook name
 * @param {Function} fn - Hook function
 * @param {number} priority - Priority (higher = earlier)
 */
function registerHook(name, fn, priority = 10) {
  if (!hooks.has(name)) {
    hooks.set(name, []);
  }
  hooks.get(name).push({ fn, priority });
  hooks.get(name).sort((a, b) => b.priority - a.priority);
}

/**
 * Execute hook chain
 * @param {string} name - Hook name
 * @param {*} data - Initial data
 * @returns {*} - Modified data
 */
async function executeHook(name, data) {
  if (!hooks.has(name)) return data;
  
  let result = data;
  for (const hook of hooks.get(name)) {
    try {
      result = await hook.fn(result);
    } catch (err) {
      console.warn(`Hook error in ${name}:`, err.message);
    }
  }
  return result;
}

/**
 * Built-in hooks
 */
const HOOKS = {
  PRE_PARSE: 'pre:parse',
  POST_PARSE: 'post:parse',
  PRE_UPDATE: 'pre:update',
  POST_UPDATE: 'post:update',
  PRE_WRITE: 'pre:write',
  POST_WRITE: 'post:write'
};

module.exports = {
  registerHook,
  executeHook,
  HOOKS
};
