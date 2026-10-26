# Plugins

This directory contains example plugins for readme-sync.

## Available Plugins

### line-numbers.js

Adds line numbers to synced code blocks.

**Installation:**
1. Copy to your project
2. Add to `.github/sync.yml`:
```yaml
plugins:
  - ./plugins/line-numbers.js
```

**Result:**
```javascript
  1 | function example() {
  2 |   return true;
  3 | }
```

## Developing Plugins

Use the plugin API:

```javascript
const { registerHook, HOOKS } = require('readme-sync/src/plugins.js');

registerHook(HOOKS.POST_UPDATE, (content) => {
  // Transform content
  return modifiedContent;
});
```

## Hook Points

- `pre:parse` - Before parsing markdown
- `post:parse` - After parsing blocks
- `pre:update` - Before generating new content
- `post:update` - After generating new content
- `pre:write` - Before writing file
- `post:write` - After writing file

## Plugin Guidelines

1. Keep plugins small and focused
2. Return modified content from hooks
3. Handle errors gracefully
4. Document your plugin
