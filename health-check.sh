#!/bin/bash

# Connection Health Check - Diagnoses frontend-backend connectivity
# Usage: ./health-check.sh

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  RecoAI Connection Health Check                        ║"
echo "║  Diagnosing Frontend-Backend Connectivity              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:5173"
API_HEALTH="$BACKEND_URL/api/health"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Initialize results
passed=0
failed=0

# Test function
test_connection() {
    local name=$1
    local url=$2
    local description=$3
    
    echo -n "Testing: $description ... "
    
    if timeout 3 curl -s -I "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((failed++))
        echo -e "  ${YELLOW}→ Could not reach: $url${NC}"
    fi
}

# Check Backend
echo -e "${BLUE}═══ BACKEND CHECKS ═══${NC}"
test_connection "backend_health" "$API_HEALTH" "Backend Health Check"
test_connection "backend_root" "$BACKEND_URL" "Backend Root Endpoint"

echo ""
echo -e "${BLUE}═══ FRONTEND CHECKS ═══${NC}"
test_connection "frontend_root" "$FRONTEND_URL" "Frontend Dev Server"

echo ""
echo -e "${BLUE}═══ PORTS CHECK ═══${NC}"

# Check if ports are in use
check_port() {
    local port=$1
    local name=$2
    
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "  ${GREEN}✓ Port $port ($name)${NC} - In use"
        else
            echo -e "  ${YELLOW}⚠ Port $port ($name)${NC} - Not in use"
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln | grep ":$port " > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓ Port $port ($name)${NC} - In use"
        else
            echo -e "  ${YELLOW}⚠ Port $port ($name)${NC} - Not in use"
        fi
    fi
}

check_port 5000 "Backend"
check_port 5173 "Frontend"

echo ""
echo -e "${BLUE}═══ ENVIRONMENT CHECK ═══${NC}"

# Check .env.local
if [ -f ".env.local" ]; then
    echo -e "  ${GREEN}✓ .env.local${NC} exists"
    
    api_url=$(grep "VITE_API_BASE_URL" .env.local | cut -d'=' -f2)
    if [ -z "$api_url" ]; then
        echo -e "  ${RED}✗ VITE_API_BASE_URL${NC} not set in .env.local"
        echo -e "    ${YELLOW}→ Add: VITE_API_BASE_URL=http://localhost:5000${NC}"
    else
        echo -e "  ${GREEN}✓ VITE_API_BASE_URL${NC} = $api_url"
    fi
else
    echo -e "  ${YELLOW}⚠ .env.local${NC} not found (using defaults)"
fi

# Check backend .env
if [ -f "backend/.env" ]; then
    echo -e "  ${GREEN}✓ backend/.env${NC} exists"
else
    echo -e "  ${YELLOW}⚠ backend/.env${NC} not found (using defaults)"
fi

echo ""
echo -e "${BLUE}═══ FILE CHECKS ═══${NC}"

# Check key files exist
if [ -f "src/lib/api.js" ]; then
    echo -e "  ${GREEN}✓${NC} src/lib/api.js (Frontend API client)"
else
    echo -e "  ${RED}✗${NC} src/lib/api.js (Frontend API client)"
fi

if [ -f "backend/app.py" ]; then
    echo -e "  ${GREEN}✓${NC} backend/app.py (Backend entry point)"
else
    echo -e "  ${RED}✗${NC} backend/app.py (Backend entry point)"
fi

if [ -f "backend/config.py" ]; then
    echo -e "  ${GREEN}✓${NC} backend/config.py (Backend config)"
else
    echo -e "  ${RED}✗${NC} backend/config.py (Backend config)"
fi

echo ""
echo -e "${BLUE}═══ SUMMARY ═══${NC}"

total=$((passed + failed))
if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed ($passed/$total)${NC}"
    echo ""
    echo "Frontend and Backend are properly connected! 🎉"
else
    echo -e "${RED}✗ Some checks failed ($passed/$total passed, $failed/$failed failed)${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting steps:${NC}"
    echo ""
    
    if ! timeout 3 curl -s "$API_HEALTH" > /dev/null 2>&1; then
        echo "1. Backend is not running"
        echo "   Solution:"
        echo "   $ cd backend"
        echo "   $ python app.py"
        echo ""
    fi
    
    if ! timeout 3 curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
        echo "2. Frontend dev server is not running"
        echo "   Solution:"
        echo "   $ npm run dev"
        echo ""
    fi
    
    echo "3. Check .env.local configuration"
    echo "   Make sure: VITE_API_BASE_URL=http://localhost:5000"
    echo ""
    
    echo "4. Try using the dev-server script to run both together"
    echo "   $ ./dev-server.sh      (macOS/Linux)"
    echo "   $ dev-server.bat       (Windows)"
fi

echo ""
echo "═════════════════════════════════════════════════════════"
echo ""

