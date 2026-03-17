#!/bin/bash

# API Test Runner Script
# Runs the frontend API test suite against the backend

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${VITE_API_BASE_URL:-http://localhost:5000}"
TEST_FILE="src/tests/api.test.js"

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  API Test Runner${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "  Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"
echo -e "${GREEN}✓ API URL: ${API_URL}${NC}"
echo -e "${GREEN}✓ Test file: ${TEST_FILE}\n${NC}"

# Run tests
echo -e "${YELLOW}Running tests...${NC}\n"
VITE_API_BASE_URL="$API_URL" node "$TEST_FILE"

exit_code=$?

echo -e "\n${BLUE}════════════════════════════════════════════════════${NC}"
if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}Test suite completed successfully${NC}"
else
    echo -e "${RED}Test suite failed with exit code $exit_code${NC}"
fi
echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"

exit $exit_code
