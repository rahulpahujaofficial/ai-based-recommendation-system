@echo off
REM RecoAI Backend Test Runner Script for Windows
REM Usage: run_tests.bat [command]

setlocal enabledelayedexpansion

REM Set colors (requires Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "NC=[0m"

REM Function to check if pytest is installed
:check_pytest
python -c "import pytest" 2>nul
if errorlevel 1 (
    echo [91m× pytest is not installed[0m
    echo [93m^ Installing pytest and dependencies...[0m
    pip install pytest pytest-cov -q
    echo [92m✓ Dependencies installed[0m
)
exit /b 0

REM Parse arguments
if "%1"=="" goto :run_all
if /i "%1"=="all" goto :run_all
if /i "%1"=="class" goto :run_class
if /i "%1"=="method" goto :run_method
if /i "%1"=="coverage" goto :run_coverage
if /i "%1"=="watch" goto :run_watch
if /i "%1"=="quick" goto :run_quick
if /i "%1"=="fast" goto :run_fast
if /i "%1"=="install" goto :install_deps
if /i "%1"=="help" goto :show_help
if /i "%1"=="--help" goto :show_help
if /i "%1"=="-h" goto :show_help

echo [91m× Unknown command: %1[0m
echo.
goto :show_help

:run_all
echo ================================
echo Running All Tests
echo ================================
call :check_pytest
python -m pytest test_api.py -v --tb=short
goto :end

:run_class
if "%2"=="" (
    echo [91m× Please specify a test class (Stores, Products, Recommendations, Analytics, Widget, Integration)[0m
    exit /b 1
)
echo ================================
echo Running Tests for %2
echo ================================
call :check_pytest
python -m pytest test_api.py::Test%2 -v --tb=short
goto :end

:run_method
if "%2"=="" (
    echo [91m× Please specify a test method name[0m
    exit /b 1
)
echo ================================
echo Running Test: %2
echo ================================
call :check_pytest
python -m pytest test_api.py -k "%2" -v --tb=short
goto :end

:run_coverage
echo ================================
echo Running Tests with Coverage Report
echo ================================
call :check_pytest
python -m pytest test_api.py --cov=. --cov-report=html --cov-report=term-missing -v
echo [92m✓ Coverage report generated in htmlcov\index.html[0m
goto :end

:run_watch
echo ================================
echo Running Tests in Watch Mode
echo ================================
python -c "import pytest_watch" 2>nul
if errorlevel 1 (
    echo [93m^ pytest-watch is not installed[0m
    echo [93m^ Installing pytest-watch...[0m
    pip install pytest-watch -q
)
ptw test_api.py -v
goto :end

:run_quick
echo ================================
echo Running Quick Tests (Stop on First Failure)
echo ================================
call :check_pytest
python -m pytest test_api.py -v -x --tb=short
goto :end

:run_fast
echo ================================
echo Running Fast Integration Tests
echo ================================
call :check_pytest
python -m pytest test_api.py::TestIntegration -v --tb=short
goto :end

:install_deps
echo ================================
echo Installing Test Dependencies
echo ================================
pip install pytest pytest-cov -q
echo [92m✓ Test dependencies installed[0m
goto :end

:show_help
echo.
echo RecoAI Backend Test Runner
echo.
echo Usage:
echo   run_tests.bat [command]
echo.
echo Commands:
echo   all              Run all tests (default)
echo   class ^<name^>     Run specific test class (e.g., Stores, Products)
echo   method ^<name^>    Run specific test method (e.g., test_create_product)
echo   coverage         Run tests with coverage report
echo   watch            Run tests in watch mode (requires pytest-watch)
echo   quick            Run tests and stop on first failure
echo   fast             Run only integration tests
echo   install          Install test dependencies only
echo   help             Show this help message
echo.
echo Examples:
echo   run_tests.bat                    # Run all tests
echo   run_tests.bat class Stores       # Run Stores tests only
echo   run_tests.bat method create_product
echo   run_tests.bat coverage           # Generate coverage report
echo.
echo Test Classes Available:
echo   - Stores                (Store management tests)
echo   - Products              (Product management tests)
echo   - Recommendations       (Recommendation tests)
echo   - Analytics             (Analytics tracking tests)
echo   - Widget                (Widget configuration tests)
echo   - Integration           (End-to-end integration tests)
echo.
goto :end

:end
echo [92m✓ Tests completed successfully![0m
endlocal
