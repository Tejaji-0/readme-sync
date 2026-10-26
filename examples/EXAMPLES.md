# Examples

This directory contains example files demonstrating `readme-sync` usage.

## Basic Example

Sync a simple utility file to README:

<!-- sync-start: examples/utils.js -->
```javascript
/**
 * Example utility module for testing readme-sync
 */

/**
 * Adds two numbers together
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - Sum of a and b
 */
function add(a, b) {
  return a + b;
}

/**
 * Greets a user with a personalized message
 * @param {string} name - The user's name
 * @returns {string} - Greeting message
 */
function greet(name) {
  return `Hello, ${name}!`;
}

module.exports = { add, greet };
```
<!-- sync-end: examples/utils.js -->

## API Client Example

Here's a real-world HTTP client example:

<!-- sync-start: examples/api-client.js -->
```javascript
/**
 * API Client Example
 * Demonstrates usage of readme-sync with real code
 * This file is referenced in EXAMPLES.md
 */

const https = require('https');

/**
 * Simple HTTP client for API requests
 */
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Make a GET request
   * @param {string} endpoint 
   * @returns {Promise<any>}
   */
  async get(endpoint) {
    return this.request('GET', endpoint);
  }

  /**
   * Make a POST request with data
   * @param {string} endpoint 
   * @param {object} data 
   * @returns {Promise<any>}
   */
  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  /**
   * Generic request method
   * @param {string} method 
   * @param {string} endpoint 
   * @param {object} data 
   */
  request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseURL);
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
      }

      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(body);
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }
}

module.exports = { APIClient };
```
<!-- sync-end: examples/api-client.js -->

## Configuration Example

Configuration file structure:

<!-- sync-start: examples/config.json -->
```json
{
  "readme-sync": {
    "autoSync": true,
    "extensions": [".js", ".ts", ".py", ".json"],
    "ignoreFiles": ["node_modules", ".git"]
  }
}
```
<!-- sync-end: examples/config.json -->

## Pre-commit Hook

Git hook for automatic syncing:

<!-- sync-start: examples/pre-commit-hook.sh -->
```bash
#!/bin/sh
# Pre-commit hook for readme-sync
# Place this file in .git/hooks/pre-commit (and make it executable)
#
# This hook ensures README is synchronized before committing

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}Checking README synchronization...${NC}"

# Run readme-sync in check mode
if node bin/readme-sync.js --check --silent; then
    echo "${GREEN}✓ README is synchronized${NC}"
    exit 0
else
    echo "${RED}✗ README is out of sync${NC}"
    echo "${YELLOW}Running readme-sync to fix...${NC}"
    
    if node bin/readme-sync.js --silent; then
        echo "${GREEN}✓ README updated. Please review and re-commit.${NC}"
        exit 1
    else
        echo "${RED}✗ Failed to update README${NC}"
        exit 1
    fi
fi
```
<!-- sync-end: examples/pre-commit-hook.sh -->

## Usage Patterns

### Pattern 1: API Documentation
Keep your API docs in sync with implementation:

```markdown
## API Reference

### Authentication
<!-- sync-start: src/auth.js -->
```javascript
// Auth implementation
```
<!-- sync-end: src/auth.js -->

### Endpoints
<!-- sync-start: src/routes.js -->
```javascript
// Routes implementation
```
<!-- sync-end: src/routes.js -->
```

### Pattern 2: Configuration Examples
Sync config examples that stay current:

```markdown
## Configuration
<!-- sync-start: config/default.json -->
```json
{ /* default config */ }
```
<!-- sync-end: config/default.json -->
```

### Pattern 3: CLI Examples
Document CLI commands from source:

```markdown
## CLI Reference
<!-- sync-start: bin/cli.js -->
```javascript
// CLI implementation
```
<!-- sync-end: bin/cli.js -->
```

## Running Examples

```bash
# Navigate to examples
cd examples

# Sync all files between markers
readme-sync -f EXAMPLES.md
```
