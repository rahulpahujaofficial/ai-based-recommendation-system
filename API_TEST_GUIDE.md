# API Test Suite Documentation

This document describes the frontend API test suite for testing the RecoAI backend APIs.

## Overview

The API test suite provides comprehensive testing of all major backend endpoints from the frontend perspective. Two implementations are available:

1. **JavaScript** (`src/tests/api.test.js`) - Uses only Node.js built-in modules, no external dependencies
2. **TypeScript** (`src/tests/api.test.ts`) - TypeScript version with full type safety

## Quick Start

### Prerequisites

- Node.js 14+ installed on your system
- Backend server running (either locally or on Codespaces)
- `.env.local` configured with `VITE_API_BASE_URL`

### Running Tests

**Using npm:**
```bash
npm run test:api
```

**Direct execution:**
```bash
# JavaScript version (no compilation needed)
node src/tests/api.test.js

# TypeScript version (requires TypeScript)
npx ts-node src/tests/api.test.ts
```

**Using helper scripts:**
```bash
# Linux/macOS
./run-api-tests.sh

# Windows
run-api-tests.bat
```

## Configuration

### Environment Variables

The test suite respects the following environment variables:

```bash
# Set backend API URL (defaults to Codespace URL if not provided)
export VITE_API_BASE_URL="https://ubiquitous-goldfish-7v6qrqj7j6jx3rj55-5000.app.github.dev/"

# Enable debug output
export DEBUG=1

# Run with specific API URL
VITE_API_BASE_URL="http://localhost:5000" npm run test:api
```

### .env.local Configuration

Create or update `.env.local` in the root directory:

```env
# Local development
VITE_API_BASE_URL=http://localhost:5000

# GitHub Codespaces
VITE_API_BASE_URL=https://ubiquitous-goldfish-7v6qrqj7j6jx3rj55-5000.app.github.dev/

# Production
VITE_API_BASE_URL=https://api.your-domain.com
```

## Test Coverage

### Test Categories

#### 1. Health & Connectivity (1 test)
- **Health Check** - Verifies backend is reachable and responding

#### 2. Store Operations (2 tests)
- **Store Creation** - Creates a test store
- **Get Store** - Retrieves store details

#### 3. Product Operations (4 tests)
- **Product Creation** - Creates a test product
- **Get Product** - Retrieves product details
- **Update Product** - Modifies product information
- **List Products** - Retrieves paginated product list

#### 4. Analytics (2 tests)
- **Analytics Event Tracking** - Tracks view events
- **Analytics Summary** - Retrieves analytics reports

#### 5. Recommendations (1 test)
- **Get Recommendations** - Retrieves trending products

#### 6. Widget (1 test)
- **Widget Configuration** - Retrieves widget configuration

#### 7. Cleanup (1 test)
- **Delete Product** - Removes test data

**Total: 12 comprehensive tests**

## API Endpoints Tested

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Backend health check |
| `/api/stores/` | POST | Create store |
| `/api/stores/{id}` | GET | Get store details |
| `/api/products/` | POST | Create product |
| `/api/products/` | GET | List products |
| `/api/products/{id}` | GET | Get product details |
| `/api/products/{id}` | PUT | Update product |
| `/api/products/{id}` | DELETE | Delete product |
| `/api/analytics/event` | POST | Track analytics events |
| `/api/analytics/summary` | GET | Get analytics summary |
| `/api/recommendations/trending` | GET | Get trending recommendations |
| `/api/widget/config` | GET | Get widget configuration |

## Output Format

The test suite produces color-coded console output:

```
✓ Health Check (45ms)
  └─ Backend is healthy (v1.0.0)

✓ Store Creation (120ms)
  └─ Created store: test-store-1699876543210

✓ Get Store (85ms)
  └─ Retrieved store: Test Store

...

▶ Test Summary

Results: 12/12 passed, 0 failed
Total Duration: 1250ms

✓ All tests passed!
```

## Test Data Isolation

The test suite uses unique identifiers to prevent data conflicts:

```javascript
const STORE_ID = `test-store-${Date.now()}`
const SESSION_ID = `test-session-${Date.now()}`
```

This ensures:
- Each test run creates unique test data
- No conflicts between concurrent test runs
- Minimal impact on production databases (tests use separate test store ID)

## Debugging

### Enable Debug Output

```bash
DEBUG=1 npm run test:api
```

This will print:
- Full error messages
- Response status codes
- Network request details
- Request/response bodies

### Troubleshooting

**Backend Connection Failed:**
```bash
# Check backend is running
curl https://ubiquitous-goldfish-7v6qrqj7j6jx3rj55-5000.app.github.dev/api/health

# Verify environment variable is set
echo $VITE_API_BASE_URL
```

**CORS Errors:**
- Ensure backend CORS is properly configured
- Check that API URL doesn't have trailing slash conflicts
- Verify backend is accepting requests from frontend origin

**Test Timeouts:**
- Increase timeout in test code if backend is slow
- Check network connectivity
- Verify backend API is responding

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      backend:
        image: python:3.11
        options: >-
          --health-cmd "curl -f http://localhost:5000/api/health || exit 1"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5000:5000

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install backend dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Start backend
        run: |
          cd backend
          python app.py &
          sleep 2

      - name: Run API tests
        run: npm run test:api
        env:
          VITE_API_BASE_URL: http://localhost:5000
```

## TypeScript Version

The TypeScript version (`src/tests/api.test.ts`) provides:

1. **Type Safety** - Full TypeScript interfaces for all API responses
2. **IDE Support** - Autocomplete and type checking
3. **Better Debugging** - Type errors caught at compile time

### To Use TypeScript Version:

```bash
# Install TypeScript (if not already installed)
npm install --save-dev typescript ts-node

# Run TypeScript tests
npm run test:api:ts
```

## Test File Locations

- **JavaScript**: [src/tests/api.test.js](src/tests/api.test.js)
- **TypeScript**: [src/tests/api.test.ts](src/tests/api.test.ts)
- **Helper Scripts**: 
  - [run-api-tests.sh](run-api-tests.sh) (Linux/macOS)
  - [run-api-tests.bat](run-api-tests.bat) (Windows)

## Performance Metrics

Typical test run metrics:

| Metric | Value |
|--------|-------|
| Total Duration | 1.2-2.0s |
| Average Test Duration | 100-150ms |
| Network Overhead | ~30% of total time |
| Database Operations | ~40% of total time |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed |
| 1 | One or more tests failed |

## Future Enhancements

Planned improvements:

- [ ] Parallel test execution
- [ ] Test coverage reports
- [ ] Performance benchmarking
- [ ] Load testing capabilities
- [ ] Contract testing support
- [ ] Mock server mode for offline testing
- [ ] Generated API client code from tests

## Support

For issues or questions about the API test suite:

1. Check the [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) for connection troubleshooting
2. Review [FIX_SUMMARY.md](FIX_SUMMARY.md) for recent fixes
3. Check backend logs for API errors
4. Run with `DEBUG=1` for verbose output

## Related Documentation

- [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) - Frontend-backend connection setup
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development environment setup
- [README.md](README.md) - Project overview
- Backend test guide: [backend/TEST_GUIDE.md](backend/TEST_GUIDE.md)
