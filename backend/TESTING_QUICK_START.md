# API Testing - Quick Reference

## One-Liner Tests

```bash
# Run everything
cd backend && python -m pytest test_api.py -v

# Or using the runner script
cd backend && ./run_tests.sh

# Windows
cd backend && run_tests.bat
```

## Common Test Commands

| Command | Purpose |
|---------|---------|
| `./run_tests.sh` | Run all 45 tests |
| `./run_tests.sh class Stores` | Test stores only |
| `./run_tests.sh class Products` | Test products only |
| `./run_tests.sh class Analytics` | Test analytics only |
| `./run_tests.sh coverage` | Generate coverage report |
| `./run_tests.sh quick` | Run and stop on first failure |
| `./run_tests.sh watch` | Run tests in watch mode |

## API Test Coverage

```
✅ Stores        (9 tests)  - Store CRUD, ID generation, validation
✅ Products      (12 tests) - Product CRUD, filtering, search, pagination
✅ Recommendations (6 tests) - Trending, context-aware, max items
✅ Analytics     (9 tests)  - Event tracking, summaries, validation
✅ Widget        (7 tests)  - Config, embed codes, serving
✅ Integration   (2 tests)  - End-to-end workflows
─────────────────────────
   TOTAL        (45 tests) ✅ ALL PASSING
```

## File Structure

```
backend/
├── test_api.py              ← Main test file (45 tests)
├── TEST_GUIDE.md            ← Detailed testing docs
├── TEST_RESULTS.md          ← Test summary
├── run_tests.sh             ← Linux/Mac test runner
├── run_tests.bat            ← Windows test runner
└── requirements.txt         ← Updated with pytest
```

## Installation

```bash
# One-time setup
cd backend
pip install -r requirements.txt

# Or just test dependencies
pip install pytest pytest-cov
```

## Running Tests

### Quick Test (recommended)
```bash
cd backend
./run_tests.sh
```

### By Test Class
```bash
./run_tests.sh class Stores      # Store endpoints
./run_tests.sh class Products    # Product endpoints
./run_tests.sh class Recommendations
./run_tests.sh class Analytics
./run_tests.sh class Widget
```

### By Test Method
```bash
./run_tests.sh method create_product
./run_tests.sh method track_event
```

### With Coverage
```bash
./run_tests.sh coverage
# Open htmlcov/index.html to view report
```

## Test Database

- **Type:** SQLite in-memory (`:memory:`)
- **Isolation:** Fresh DB for each test session
- **Cleanup:** Automatic after tests
- **Performance:** ~5-6 seconds for all 45 tests
- **Side Effects:** None (safe to run anytime)

## Expected Output

```
============================= test session starts ==============================
collected 45 items

test_api.py::TestStores::test_create_store_success PASSED                [  2%]
test_api.py::TestStores::test_create_store_auto_generate_id PASSED       [  4%]
... (43 more tests)
test_api.py::TestIntegration::test_end_to_end_with_analytics PASSED      [100%]

============================== 45 passed in 5.61s ==============================
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: pytest` | `pip install pytest pytest-cov` |
| Script won't run | `chmod +x run_tests.sh` (Linux/Mac) |
| Database errors | Tests use fresh DB each time; no DB conflicts |
| Slow tests | Normal; in-memory DB is fast (~5-6 sec total) |

## Endpoints Tested

### Stores
- ✅ Create (with/without custom ID)
- ✅ Read (get, list)
- ✅ Update
- ✅ Validation

### Products
- ✅ Create (full/minimal)
- ✅ Read (paginated, filtered)
- ✅ Update
- ✅ Delete
- ✅ Search
- ✅ Category filter

### Recommendations
- ✅ Get with/without source product
- ✅ Trending products
- ✅ Max items parameter
- ✅ Analysis endpoint
- ✅ Bulk retrain

### Analytics
- ✅ Event tracking (view, click, purchase)
- ✅ Summary stats
- ✅ Metadata support
- ✅ Validation

### Widget
- ✅ Configuration (get/update)
- ✅ Embed codes
- ✅ Widget serving
- ✅ Token validation

## Sample Test Run

```bash
$ cd backend
$ ./run_tests.sh

================================
Running All Tests
================================
python -m pytest test_api.py -v --tb=short

===== test session starts =====
collected 45 items

test_api.py::TestStores::test_create_store_success PASSED          [  2%]
test_api.py::TestStores::test_create_store_auto_generate_id PASSED [  4%]
...
test_api.py::TestIntegration::test_end_to_end_with_analytics PASSED [100%]

============================== 45 passed in 5.61s ==============================
✓ Tests completed successfully!
```

## Writing New Tests

```python
class TestNewFeature:
    """Test description."""
    
    @pytest.fixture
    def setup(self, client):
        """Create fixtures."""
        return client.post("/api/stores/", json={"name": "Test"})
    
    def test_something(self, client, setup):
        """Test description."""
        response = client.get("/api/endpoint")
        assert response.status_code == 200
        assert "field" in response.get_json()
```

## Integration with CI/CD

Add to `.github/workflows/test.yml`:
```yaml
- name: Run Backend Tests
  run: |
    cd backend
    pip install -r requirements.txt
    pytest test_api.py -v --tb=short
```

## Documentation Files

- **TEST_GUIDE.md** - Comprehensive testing documentation
- **TEST_RESULTS.md** - Full test results summary
- **test_api.py** - Source code with inline comments
- **run_tests.sh** - Test runner (Linux/Mac)
- **run_tests.bat** - Test runner (Windows)

---

**Ready to test?** Run `cd backend && ./run_tests.sh` to start!
