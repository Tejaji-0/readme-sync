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
