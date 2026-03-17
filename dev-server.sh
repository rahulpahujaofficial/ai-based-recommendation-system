#!/bin/bash

# Development Server Starter - Runs frontend and backend together
# Usage: ./dev-server.sh

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║  RecoAI Development Server Starter                     ║"
echo "║  Starting Frontend & Backend                           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if backend directory exists
if [ ! -d "$SCRIPT_DIR/backend" ]; then
    echo -e "${RED}❌ Backend directory not found${NC}"
    exit 1
fi

# Check if frontend directory has vite
if [ ! -f "$SCRIPT_DIR/package.json" ]; then
    echo -e "${RED}❌ Frontend package.json not found${NC}"
    exit 1
fi

echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
cd "$SCRIPT_DIR"

# Install frontend deps if needed
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo -e "${YELLOW}  • Installing frontend dependencies${NC}"
    npm ci --silent || npm install --silent
else
    echo -e "${GREEN}  ✓ Frontend dependencies already installed${NC}"
fi

# Install backend deps if needed
if [ ! -d "$SCRIPT_DIR/backend/venv" ] && ! python -c "import flask" 2>/dev/null; then
    echo -e "${YELLOW}  • Installing backend dependencies${NC}"
    cd "$SCRIPT_DIR/backend"
    pip install -q -r requirements.txt || true
    cd "$SCRIPT_DIR"
else
    echo -e "${GREEN}  ✓ Backend dependencies already installed${NC}"
fi

# Create backend .env if it doesn't exist
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    echo -e "${YELLOW}  • Creating backend/.env${NC}"
    cat > "$SCRIPT_DIR/backend/.env" << EOF
FLASK_DEBUG=true
SECRET_KEY=dev-secret-key-change-in-production
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=sqlite:///recoai.db
EOF
fi

echo -e "\n${GREEN}✓ Dependencies ready${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}⏹️  Stopping development servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo -e "${BLUE}👋 Development servers stopped${NC}\n"
}

trap cleanup EXIT

# Start backend
echo -e "${BLUE}🚀 Starting Backend...${NC}"
cd "$SCRIPT_DIR/backend"
python app.py 2>&1 | sed 's/^/  [BACKEND] /' &
BACKEND_PID=$!
echo -e "${GREEN}  Backend PID: $BACKEND_PID${NC}"

# Wait for backend to start
sleep 2
echo -e "${BLUE}✓ Backend started${NC}\n"

# Start frontend
echo -e "${BLUE}🚀 Starting Frontend...${NC}"
cd "$SCRIPT_DIR"
npm run dev 2>&1 | sed 's/^/  [FRONTEND] /' &
FRONTEND_PID=$!
echo -e "${GREEN}  Frontend PID: $FRONTEND_PID${NC}"

# Wait for frontend to start
sleep 3

echo -e "\n${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Development servers running!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}\n"

echo -e "🌐 Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "🔧 Backend:   ${BLUE}http://localhost:5000${NC}"
echo -e "📡 API:       ${BLUE}http://localhost:5000/api${NC}"
echo -e "🏥 Health:    ${BLUE}http://localhost:5000/api/health${NC}"

echo -e "\n${YELLOW}Press Ctrl+C to stop both servers${NC}\n"

# Wait for both processes
wait

