# Frontend API Test Suite - Quick Reference

## ✅ Installation Complete!

Your frontend API test suite is ready to use. Here's what was created:

## 📁 Files Created

```
src/tests/
├── api.test.js          ← JavaScript implementation (recommended)
└── api.test.ts          ← TypeScript implementation (with types)

run-api-tests.sh         ← Bash helper script
run-api-tests.bat        ← Windows batch helper script
API_TEST_GUIDE.md        ← Complete documentation
```

## 🚀 Quick Start (Choose One)

### Option 1: NPM Script (Recommended)
```bash
npm run test:api
```

### Option 2: Direct Node Execution
```bash
node src/tests/api.test.js
```

### Option 3: Helper Script
```bash
# Linux/macOS
./run-api-tests.sh

# Windows
run-api-tests.bat
```

### Option 4: Custom Backend URL
```bash
# Test against specific backend
VITE_API_BASE_URL="https://your-backend-url.com" npm run test:api
```

## 📊 What Gets Tested

| Category | Tests | Endpoints |
|----------|-------|-----------|
| Health | 1 | `/api/health` |
| Stores | 2 | `/api/stores/*` |
| Products | 4 | `/api/products/*` |
| Analytics | 2 | `/api/analytics/*` |
| Recommendations | 1 | `/api/recommendations/*` |
| Widget | 1 | `/api/widget/*` |
| Cleanup | 1 | `/api/products/{id}` (DELETE) |
| **Total** | **12** | **All major endpoints** |

## ✨ Expected Output

All tests pass with color-coded output:
```
✓ Health Check (89ms)
✓ Store Creation (23ms)
✓ Get Store (5ms)
✓ Product Creation (19ms)
✓ Get Product (27ms)
✓ Update Product (17ms)
✓ List Products (7ms)
✓ Analytics Event Tracking (16ms)
✓ Analytics Summary (8ms)
✓ Get Recommendations (5ms)
✓ Widget Configuration (5ms)
✓ Delete Product (12ms)

Results: 12/12 passed, 0 failed
Total Duration: 233ms

✓ All tests passed!
```

## 🔧 Configuration

### Default Behavior
- Tests run against `http://localhost:5000` by default
- Backend must be running
- Uses in-memory SQLite (no production data)

### Environment Variables
```bash
# Custom backend URL
export VITE_API_BASE_URL="http://your-server:5000"

# Enable debug output
export DEBUG=1

# Use in one command
VITE_API_BASE_URL="http://localhost:5000" npm run test:api
```

### Configure via .env.local
Create or update `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

## 📚 Implementation Details

### JavaScript Version (Recommended)
- **File**: `src/tests/api.test.js`
- **Dependencies**: None (uses Node.js built-in fetch)
- **Size**: ~634 lines
- **Speed**: Fast startup, immediate execution
- **Best For**: Quick testing, CI/CD pipelines

### TypeScript Version (Optional)
- **File**: `src/tests/api.test.ts`
- **Dependencies**: TypeScript (installed on demand)
- **Size**: ~752 lines
- **Features**: Full type safety, IDE autocomplete
- **Best For**: Development, type-safe testing
- **Run**: `npx ts-node src/tests/api.test.ts`

## 🎯 Common Tasks

### Run tests once
```bash
npm run test:api
```

### Run tests with custom backend
```bash
VITE_API_BASE_URL="https://api.example.com" npm run test:api
```

### Run tests in debug mode
```bash
DEBUG=1 npm run test:api
```

### Run tests automatically on file changes (experimental)
```bash
npm run test:api:watch
```

### Get help with a specific command
```bash
node src/tests/api.test.js --help
# or
./run-api-tests.sh --help
```

## 🐛 Troubleshooting

### Backend Not Reachable
```bash
# Test connectivity
curl http://localhost:5000/api/health

# Check backend is running
ps aux | grep -i python
```

### Wrong API URL
```bash
# Verify environment variable
echo $VITE_API_BASE_URL

# Set correct URL
export VITE_API_BASE_URL="http://localhost:5000"
```

### Port Already in Use
```bash
# Find what's using port 5000
lsof -i :5000

# Stop the process
kill -9 <PID>
```

### CORS Errors
- Check backend CORS configuration in `backend/app.py`
- Verify API URL doesn't have trailing slash inconsistencies
- Ensure backend accepts your frontend origin

## 📖 Full Documentation

For complete documentation, see:
- **API_TEST_GUIDE.md** - Full API test documentation
- **CONNECTION_GUIDE.md** - Frontend-backend connection setup
- **DEVELOPMENT.md** - Development environment setup

## 💡 Tips

1. **Default Configuration Works**: Tests run with default settings against localhost
2. **No External Dependencies**: JavaScript version requires no npm packages
3. **Test Isolation**: Each run creates unique test data, no conflicts
4. **Fast Execution**: Complete suite runs in ~250ms
5. **CI/CD Ready**: Exit code 0 on success, 1 on failure

## 🔗 Related Commands

```bash
# Start frontend dev server
npm run dev

# Build frontend
npm run build

# Preview production build
npm run preview

# Run all tests (frontend API tests)
npm test
```

## ❓ Need Help?

1. Check the [API_TEST_GUIDE.md](API_TEST_GUIDE.md) guide
2. Review [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md) for connection issues
3. Enable debug mode: `DEBUG=1 npm run test:api`
4. Check backend logs for errors

## ✅ Verification

To verify everything is set up correctly, run:

```bash
npm run test:api
```

You should see all 12 tests pass in about 200-300ms.

---

**Summary**: Your test suite is ready! Run `npm run test:api` to get started. 🎉
