# 🧪 Backend API Test Suite - Complete Setup

**Status:** ✅ Complete and Ready to Use  
**Tests:** 45 comprehensive API tests  
**Coverage:** All major endpoints  
**Execution Time:** ~5-6 seconds  

---

## 📋 Files Created

| File | Size | Purpose |
|------|------|---------|
| **test_api.py** | 26 KB | Main test file with 45 tests |
| **run_tests.sh** | 4.8 KB | Linux/Mac test runner |
| **run_tests.bat** | 4.4 KB | Windows test runner |
| **TEST_GUIDE.md** | 4.9 KB | Comprehensive testing guide |
| **TEST_RESULTS.md** | 5.5 KB | Test results & summary |
| **TESTING_QUICK_START.md** | 5.5 KB | Quick reference |
| **requirements.txt** | Updated | Added pytest dependencies |

---

## 🚀 Quick Start (Choose Your OS)

### Linux / macOS
```bash
cd backend
./run_tests.sh
```

### Windows (PowerShell/CMD)
```bash
cd backend
run_tests.bat
```

### Manual (Any OS)
```bash
cd backend
python -m pytest test_api.py -v
```

---

## 📊 Test Coverage

```
✅ TestStores         (9 tests)  - Store CRUD operations
✅ TestProducts       (12 tests) - Product management with filtering
✅ TestRecommendations (6 tests) - AI recommendations engine
✅ TestAnalytics      (9 tests)  - Event tracking & analytics
✅ TestWidget         (7 tests)  - Widget configuration & embedding
✅ TestIntegration    (2 tests)  - End-to-end workflows
─────────────────────────────────────────────────────────
   TOTAL              45 tests   ✅ ALL PASSING
```

---

## 🎯 API Endpoints Tested

### 🏪 Stores API
```
✅ POST   /api/stores/                 Create store
✅ GET    /api/stores/<store_id>       Get store
✅ PUT    /api/stores/<store_id>       Update store  
✅ GET    /api/stores/                 List stores
```

### 📦 Products API
```
✅ POST   /api/products/               Create product
✅ GET    /api/products/               List (paginated, filtered)
✅ GET    /api/products/<product_id>   Get product
✅ PUT    /api/products/<product_id>   Update product
✅ DELETE /api/products/<product_id>   Delete product
```

### 🤖 Recommendations API
```
✅ GET    /api/recommendations/        Get recommendations
✅ GET    /api/recommendations/trending Get trending
✅ POST   /api/recommendations/analyze  Analyze product
✅ POST   /api/recommendations/retrain  Bulk retrain
```

### 📊 Analytics API
```
✅ POST   /api/analytics/event         Track event
✅ GET    /api/analytics/summary       Get summary
```

### 🧩 Widget API
```
✅ GET    /api/widget/config           Get configuration
✅ PUT    /api/widget/config           Update configuration
✅ GET    /api/widget/embed-codes      Get embed codes
✅ GET    /widget/<token>              Serve widget
```

---

## 🔧 Test Commands

### Run All Tests
```bash
./run_tests.sh                    # All tests
./run_tests.sh all               # Same as above

# Manual
python -m pytest test_api.py -v
```

### Run Specific Test Suite
```bash
./run_tests.sh class Stores           # Store tests only
./run_tests.sh class Products         # Product tests only
./run_tests.sh class Recommendations  # Recommendation tests
./run_tests.sh class Analytics        # Analytics tests
./run_tests.sh class Widget           # Widget tests
./run_tests.sh class Integration      # Integration tests
```

### Run Specific Test
```bash
./run_tests.sh method create_product
./run_tests.sh method track_event

# Manual
pytest test_api.py::TestProducts::test_create_product -v
pytest test_api.py -k "create" -v
```

### Advanced Options
```bash
./run_tests.sh coverage               # Generate coverage report
./run_tests.sh quick                  # Stop on first failure
./run_tests.sh watch                  # Watch mode (requires pytest-watch)
./run_tests.sh fast                   # Faster tests only
./run_tests.sh install                # Install dependencies only
./run_tests.sh help                   # Show all options
```

---

## 📈 Test Features

### ✨ Comprehensive
- **45 tests** covering all main endpoints
- Tests for **success paths & error cases**
- **Pagination, filtering, searching** tested
- **Validation & error handling** verified

### ✨ Isolated
- Fresh **in-memory database** per test
- **No side effects** on production data
- Tests run **independently**
- Can run in **any order**

### ✨ Fast
- Full suite: **~5-6 seconds**
- Single test: **<100ms typically**
- Database: **in-memory SQLite**

### ✨ Developer Friendly
- **Color-coded output**
- **Clear test names**
- **Detailed documentation**
- **Easy to extend**

---

## 📚 Documentation

For detailed information, see:

1. **TESTING_QUICK_START.md** - Quick reference guide
2. **TEST_GUIDE.md** - Comprehensive testing documentation
3. **TEST_RESULTS.md** - Full test results and summary
4. **test_api.py** - Test source code with comments

---

## 🧠 Test Structure

Each test class follows this pattern:

```python
class TestFeatureName:
    """Test description."""
    
    @pytest.fixture
    def setup(self, client):
        """Create test fixtures."""
        # Setup code
        return data
    
    def test_something(self, client, setup):
        """Test description."""
        response = client.post("/api/endpoint", json={...})
        assert response.status_code == 200
        assert "field" in response.get_json()
```

---

## 📦 Dependencies

Tests require:
- `pytest>=7.4` - Test framework
- `pytest-cov>=4.1` - Coverage reporting

Install via:
```bash
pip install -r requirements.txt
# or
pip install pytest pytest-cov
```

---

## 🔍 Example Test Run

```bash
$ cd backend && ./run_tests.sh

================================
Running All Tests
================================

===== test session starts =====
platform linux -- Python 3.12.1, pytest-9.0.2
rootdir: /workspaces/ai-based-recommendation-system/backend
plugins: cov-7.0.0, anyio-4.11.0

collecting ... collected 45 items

test_api.py::TestStores::test_create_store_success PASSED           [  2%]
test_api.py::TestStores::test_create_store_auto_generate_id PASSED  [  4%]
test_api.py::TestStores::test_create_store_custom_id PASSED         [  6%]
test_api.py::TestStores::test_create_store_missing_name PASSED      [  8%]
test_api.py::TestStores::test_create_store_duplicate_id PASSED      [ 11%]
test_api.py::TestStores::test_get_store PASSED                      [ 13%]
test_api.py::TestStores::test_get_store_not_found PASSED            [ 15%]
test_api.py::TestStores::test_update_store PASSED                   [ 17%]
test_api.py::TestStores::test_list_stores PASSED                    [ 20%]
test_api.py::TestProducts::test_create_product PASSED               [ 22%]
... (35 more tests)
test_api.py::TestIntegration::test_end_to_end_with_analytics PASSED [100%]

============================== 45 passed in 5.61s ==============================
✓ Tests completed successfully!
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| pytest not found | `pip install pytest pytest-cov` |
| Script permission denied | `chmod +x run_tests.sh` |
| Import errors | Ensure you're in `backend/` directory |
| Database conflicts | Tests use in-memory DB; no conflicts possible |
| Tests timeout | Normal; should complete in ~5-6 seconds |

---

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pytest test_api.py -v --tb=short
```

### GitLab CI
```yaml
test:backend:
  image: python:3.11
  script:
    - cd backend
    - pip install -r requirements.txt
    - pytest test_api.py -v --tb=short
```

---

## 🤝 Adding New Tests

1. **Open test_api.py**
2. **Add test to appropriate class or create new class**:
   ```python
   def test_new_feature(self, client, fixtures):
       response = client.post("/api/endpoint", json={...})
       assert response.status_code == 201
   ```
3. **Run tests**: `./run_tests.sh`
4. **Verify new test passes**

---

## 📊 Coverage Report

Generate and view coverage:
```bash
./run_tests.sh coverage

# Then open:
# Linux/Mac: open htmlcov/index.html
# Windows:   start htmlcov/index.html
```

---

## ✅ Validation Checklist

- [x] All 45 tests passing
- [x] Stores API covered (9 tests)
- [x] Products API covered (12 tests)  
- [x] Recommendations API covered (6 tests)
- [x] Analytics API covered (9 tests)
- [x] Widget API covered (7 tests)
- [x] Integration tests (2 tests)
- [x] Test runners created (bash & batch)
- [x] Documentation complete
- [x] Dependencies added to requirements.txt

---

## 🎮 Next Steps

1. **Run the tests immediately:**
   ```bash
   cd backend
   ./run_tests.sh
   ```

2. **Review coverage:**
   ```bash
   ./run_tests.sh coverage
   ```

3. **Add to your workflow:**
   - Run before commits
   - Add to CI/CD pipeline
   - Share with team

4. **Extend as needed:**
   - Add tests for new endpoints
   - Increase coverage targets
   - Monitor test performance

---

## 📞 Support

For questions or issues:
1. Check **TESTING_QUICK_START.md** for quick answers
2. See **TEST_GUIDE.md** for detailed documentation
3. Review **test_api.py** for test examples
4. Run `./run_tests.sh help` for command reference

---

**✨ Your backend API is now fully tested and ready for production!**

Happy testing! 🚀
