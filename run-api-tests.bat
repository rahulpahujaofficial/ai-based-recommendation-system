@echo off
REM API Test Runner Script for Windows
REM Runs the frontend API test suite against the backend

setlocal enabledelayedexpansion

REM Colors using ANSI escape codes (requires Windows 10+)
set "BLUE=[0;34m"
set "GREEN=[0;32m"
set "RED=[0;31m"
set "YELLOW=[1;33m"
set "NC=[0m"

REM Configuration
if not defined VITE_API_BASE_URL (
    set "API_URL=http://localhost:5000"
) else (
    set "API_URL=%VITE_API_BASE_URL%"
)

set "TEST_FILE=src\tests\api.test.js"

echo.
echo ════════════════════════════════════════════════════
echo   API Test Runner
echo ════════════════════════════════════════════════════
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Get Node version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i

echo OK Node.js found: %NODE_VERSION%
echo OK API URL: %API_URL%
echo OK Test file: %TEST_FILE%
echo.

REM Run tests
echo Running tests...
echo.

set "VITE_API_BASE_URL=%API_URL%"
node "%TEST_FILE%"

set exit_code=%errorlevel%

echo.
echo ════════════════════════════════════════════════════

if %exit_code% equ 0 (
    echo OK Test suite completed successfully
) else (
    echo Error: Test suite failed with exit code %exit_code%
)

echo ════════════════════════════════════════════════════
echo.

exit /b %exit_code%
