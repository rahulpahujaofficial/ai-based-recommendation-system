@echo off
REM Connection Health Check - Diagnoses frontend-backend connectivity (Windows)
REM Usage: health-check.bat

setlocal enabledelayedexpansion

echo.
echo ======================================================
echo   RecoAI Connection Health Check
echo   Diagnosing Frontend-Backend Connectivity
echo ======================================================
echo.

set BACKEND_URL=http://localhost:5000
set FRONTEND_URL=http://localhost:5173
set API_HEALTH=%BACKEND_URL%/api/health

set passed=0
set failed=0

REM ========== BACKEND CHECKS ==========
echo [INFO] BACKEND CHECKS
echo.

echo Checking: Backend Health Check...
curl -s -I %API_HEALTH% >nul 2>&1
if !errorlevel! equ 0 (
    echo  [OK] Backend Health Check
    set /a passed+=1
) else (
    echo  [FAIL] Backend Health Check - Could not reach %API_HEALTH%
    set /a failed+=1
)

echo Checking: Backend Root Endpoint...
curl -s -I %BACKEND_URL% >nul 2>&1
if !errorlevel! equ 0 (
    echo  [OK] Backend Root Endpoint
    set /a passed+=1
) else (
    echo  [FAIL] Backend Root Endpoint - Could not reach %BACKEND_URL%
    set /a failed+=1
)

echo.
echo [INFO] FRONTEND CHECKS
echo.

echo Checking: Frontend Dev Server...
curl -s -I %FRONTEND_URL% >nul 2>&1
if !errorlevel! equ 0 (
    echo  [OK] Frontend Dev Server
    set /a passed+=1
) else (
    echo  [FAIL] Frontend Dev Server - Could not reach %FRONTEND_URL%
    set /a failed+=1
)

echo.
echo [INFO] PORTS CHECK
echo.

REM Check if ports are in use
netstat -ano | findstr ":5000 " >nul 2>&1
if !errorlevel! equ 0 (
    echo  [OK] Port 5000 (Backend) - In use
) else (
    echo  [WARN] Port 5000 (Backend) - Not in use
)

netstat -ano | findstr ":5173 " >nul 2>&1
if !errorlevel! equ 0 (
    echo  [OK] Port 5173 (Frontend) - In use
) else (
    echo  [WARN] Port 5173 (Frontend) - Not in use
)

echo.
echo [INFO] ENVIRONMENT CHECK
echo.

if exist ".env.local" (
    echo  [OK] .env.local exists
    findstr "VITE_API_BASE_URL" .env.local >nul 2>&1
    if !errorlevel! equ 0 (
        for /f "tokens=2 delims==" %%A in ('findstr "VITE_API_BASE_URL" .env.local') do (
            echo  [OK] VITE_API_BASE_URL = %%A
        )
    ) else (
        echo  [FAIL] VITE_API_BASE_URL not set in .env.local
        echo        ^ Add: VITE_API_BASE_URL=http://localhost:5000
    )
) else (
    echo  [WARN] .env.local not found (using defaults)
)

if exist "backend\.env" (
    echo  [OK] backend\.env exists
) else (
    echo  [WARN] backend\.env not found (using defaults)
)

echo.
echo [INFO] FILE CHECKS
echo.

if exist "src\lib\api.js" (
    echo  [OK] src\lib\api.js (Frontend API client)
) else (
    echo  [FAIL] src\lib\api.js (Frontend API client)
)

if exist "backend\app.py" (
    echo  [OK] backend\app.py (Backend entry point)
) else (
    echo  [FAIL] backend\app.py (Backend entry point)
)

if exist "backend\config.py" (
    echo  [OK] backend\config.py (Backend config)
) else (
    echo  [FAIL] backend\config.py (Backend config)
)

echo.
echo ======================================================
echo   SUMMARY
echo ======================================================
echo.

if %failed% equ 0 (
    echo [OK] All checks passed (%passed% passed, 0 failed)
    echo.
    echo Frontend and Backend are properly connected! 
) else (
    echo [WARN] Some checks failed (%passed% passed, %failed% failed)
    echo.
    echo TROUBLESHOOTING:
    echo.
    echo 1. Backend is not running
    echo    Solution:
    echo    cd backend
    echo    python app.py
    echo.
    echo 2. Frontend dev server is not running
    echo    Solution:
    echo    npm run dev
    echo.
    echo 3. Check .env.local configuration
    echo    Make sure: VITE_API_BASE_URL=http://localhost:5000
    echo.
    echo 4. Try using the dev-server script to run both together
    echo    dev-server.bat
)

echo.
echo ======================================================
echo.
pause

