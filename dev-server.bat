@echo off
REM Development Server Starter for Windows
REM Runs frontend and backend together
REM Usage: dev-server.bat

setlocal enabledelayedexpansion

echo.
echo ======================================================
echo   RecoAI Development Server Starter
echo   Starting Frontend ^& Backend
echo ======================================================
echo.

REM Check if backend directory exists
if not exist "backend\" (
    echo [ERROR] Backend directory not found
    pause
    exit /b 1
)

REM Check if frontend package.json exists
if not exist "package.json" (
    echo [ERROR] Frontend package.json not found
    pause
    exit /b 1
)

echo [INFO] Installing dependencies...

REM Install frontend deps if needed
if not exist "node_modules\" (
    echo   - Installing frontend dependencies
    call npm install --silent
    if errorlevel 1 call npm install
) else (
    echo   - Frontend dependencies already installed
)

REM Create backend .env if it doesn't exist
if not exist "backend\.env" (
    echo   - Creating backend\.env
    (
        echo FLASK_DEBUG=true
        echo SECRET_KEY=dev-secret-key-change-in-production
        echo PORT=5000
        echo FRONTEND_URL=http://localhost:5173
        echo DATABASE_URL=sqlite:///recoai.db
    ) > "backend\.env"
)

echo [OK] Dependencies ready
echo.

REM Start backend in new window
echo [INFO] Starting Backend...
start "RecoAI Backend" cmd /k "cd backend && python app.py"
echo [OK] Backend started
echo.

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Start frontend in new window
echo [INFO] Starting Frontend...
start "RecoAI Frontend" cmd /k "npm run dev"
echo [OK] Frontend started
echo.

echo ======================================================
echo   Development servers running!
echo ======================================================
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000
echo   API:       http://localhost:5000/api
echo   Health:    http://localhost:5000/api/health
echo.
echo   Check the opened windows for server output.
echo   Close the windows or press Ctrl+C to stop servers.
echo.
pause

