#!/bin/bash

# RecoAI Backend Test Runner Script
# Usage: ./run_tests.sh [command]

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print headers
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if pytest is installed
check_pytest() {
    if ! python -c "import pytest" 2>/dev/null; then
        print_error "pytest is not installed"
        print_warning "Installing pytest and dependencies..."
        pip install pytest pytest-cov -q
        print_success "Dependencies installed"
    fi
}

# Run all tests
run_all() {
    print_header "Running All Tests"
    check_pytest
    python -m pytest test_api.py -v --tb=short
}

# Run specific test class
run_class() {
    local class_name=$1
    if [ -z "$class_name" ]; then
        print_error "Please specify a test class (Stores, Products, Recommendations, Analytics, Widget, Integration)"
        exit 1
    fi
    print_header "Running Tests for $class_name"
    check_pytest
    python -m pytest test_api.py::Test${class_name} -v --tb=short
}

# Run specific test method
run_method() {
    local method=$1
    if [ -z "$method" ]; then
        print_error "Please specify a test method name"
        exit 1
    fi
    print_header "Running Test: $method"
    check_pytest
    python -m pytest test_api.py -k "$method" -v --tb=short
}

# Run with coverage
run_coverage() {
    print_header "Running Tests with Coverage Report"
    check_pytest
    python -m pytest test_api.py --cov=. --cov-report=html --cov-report=term-missing -v
    print_success "Coverage report generated in htmlcov/index.html"
}

# Run in watch mode (requires pytest-watch)
run_watch() {
    print_header "Running Tests in Watch Mode"
    if ! python -c "import pytest_watch" 2>/dev/null; then
        print_warning "pytest-watch is not installed"
        print_warning "Installing pytest-watch..."
        pip install pytest-watch -q
    fi
    ptw test_api.py -v
}

# Run quick tests (stop on first failure)
run_quick() {
    print_header "Running Quick Tests (Stop on First Failure)"
    check_pytest
    python -m pytest test_api.py -v -x --tb=short
}

# Run only specific test suite
run_fast() {
    print_header "Running Fast Integration Tests"
    check_pytest
    python -m pytest test_api.py::TestIntegration -v --tb=short
}

# Install dependencies
install_deps() {
    print_header "Installing Test Dependencies"
    pip install pytest pytest-cov -q
    print_success "Test dependencies installed"
}

# Show help
show_help() {
    cat << EOF
${BLUE}RecoAI Backend Test Runner${NC}

${GREEN}Usage:${NC}
  ./run_tests.sh [command]

${GREEN}Commands:${NC}
  all              Run all tests (default)
  class <name>     Run specific test class (e.g., Stores, Products)
  method <name>    Run specific test method (e.g., test_create_product)
  coverage         Run tests with coverage report
  watch            Run tests in watch mode (requires pytest-watch)
  quick            Run tests and stop on first failure
  fast             Run only integration tests
  install          Install test dependencies only
  help             Show this help message

${GREEN}Examples:${NC}
  ./run_tests.sh                    # Run all tests
  ./run_tests.sh class Stores       # Run Stores tests only
  ./run_tests.sh method create_product
  ./run_tests.sh coverage           # Generate coverage report
  ./run_tests.sh quick              # Quick run, stop on first failure

${BLUE}Test Classes Available:${NC}
  - Stores                (Store management tests)
  - Products              (Product management tests)
  - Recommendations       (Recommendation tests)
  - Analytics             (Analytics tracking tests)
  - Widget                (Widget configuration tests)
  - Integration           (End-to-end integration tests)

EOF
}

# Main script logic
case "${1:-all}" in
    all)
        run_all
        ;;
    class)
        run_class "$2"
        ;;
    method)
        run_method "$2"
        ;;
    coverage)
        run_coverage
        ;;
    watch)
        run_watch
        ;;
    quick)
        run_quick
        ;;
    fast)
        run_fast
        ;;
    install)
        install_deps
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

print_success "Tests completed successfully!"
