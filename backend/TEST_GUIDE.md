# Backend API Testing Guide

This guide explains how to run and manage the comprehensive API test suite for the RecoAI backend.

## Installation

First, install pytest and coverage tools:

```bash
pip install pytest pytest-cov
```

Or update your requirements.txt:

```bash
pip install -r requirements.txt
```

## Running Tests

### Run all tests
```bash
pytest test_api.py -v
```

### Run specific test class
```bash
pytest test_api.py::TestStores -v
pytest test_api.py::TestProducts -v
pytest test_api.py::TestRecommendations -v
pytest test_api.py::TestAnalytics -v
pytest test_api.py::TestWidget -v
```

### Run specific test method
```bash
pytest test_api.py::TestStores::test_create_store_success -v
pytest test_api.py::TestProducts::test_list_products -v
```

### Run with coverage report
```bash
pytest test_api.py --cov=. --cov-report=html
```
This generates an HTML coverage report in `htmlcov/index.html`

### Run tests in quiet mode
```bash
pytest test_api.py -q
```

### Run tests and stop on first failure
```bash
pytest test_api.py -x
```

### Run tests with detailed output
```bash
pytest test_api.py -vv
```

## Test Coverage

The test suite covers:

### **Stores** (11 tests)
- ✅ Create store with custom properties
- ✅ Auto-generate store IDs
- ✅ Prevent duplicate store IDs
- ✅ Retrieve single store
- ✅ Update store properties
- ✅ List all stores
- ✅ Error handling for missing fields

### **Products** (13 tests)
- ✅ Create products with full/minimal fields
- ✅ List products with pagination
- ✅ Filter by category
- ✅ Search products by name
- ✅ Retrieve single product
- ✅ Update products
- ✅ Delete products
- ✅ Error handling

### **Recommendations** (6 tests)
- ✅ Get trending recommendations
- ✅ Get context-aware recommendations with source product
- ✅ Handle recommendations without source product
- ✅ Respect max_items parameter
- ✅ Error handling

### **Analytics** (9 tests)
- ✅ Track view events
- ✅ Track click events
- ✅ Track purchase events
- ✅ Track events with metadata
- ✅ Get analytics summary
- ✅ Error handling for missing required fields

### **Widget** (7 tests)
- ✅ Get widget configuration
- ✅ Update widget configuration
- ✅ Get embed codes
- ✅ Serve widget HTML
- ✅ Error handling

### **Integration** (2 tests)
- ✅ End-to-end store and product workflow
- ✅ End-to-end workflow with analytics

## Test Database

Tests use an in-memory SQLite database (`sqlite:///:memory:`) that:
- Is created fresh for each test session
- Is destroyed after tests complete
- Has zero side effects on production database
- Runs very fast (~1-2 seconds for full suite)

## Writing New Tests

### Test Structure
```python
class TestNewFeature:
    """Test description."""
    
    @pytest.fixture
    def setup_data(self, client):
        """Create test fixtures."""
        # Setup code here
        return data
    
    def test_something(self, client, setup_data):
        """Test description."""
        response = client.get("/api/endpoint")
        assert response.status_code == 200
        data = response.get_json()
        assert "expected_field" in data
```

### HTTP Methods
```python
# GET
response = client.get("/api/path?param=value")

# POST
response = client.post("/api/path", json={"key": "value"})

# PUT
response = client.put("/api/path/{id}", json={"key": "updated"})

# DELETE
response = client.delete("/api/path/{id}")
```

### Assertions
```python
# Status codes
assert response.status_code == 200
assert response.status_code == 201
assert response.status_code == 400

# Response data
data = response.get_json()
assert data["field"] == "expected_value"
assert "field" in data

# Content type
assert "application/json" in response.content_type
```

## CI/CD Integration

To integrate tests into your CI/CD pipeline, add to your workflow:

```yaml
- name: Run Backend Tests
  run: |
    cd backend
    pip install -r requirements.txt
    pytest test_api.py -v --tb=short
```

## Troubleshooting

### Test failures due to database state
- Tests use in-memory DB, so this shouldn't happen
- If it does, try: `pytest test_api.py --cache-clear`

### Import errors
- Ensure you're in the `backend/` directory
- Check that `app.py` and other modules exist
- Run: `python -m pytest test_api.py`

### Tests hang or timeout
- Check for infinite loops in services
- Increase timeout: `pytest test_api.py --timeout=30`

## Test Performance

Current performance metrics:
- Full test suite: ~2-5 seconds
- Single test: <100ms typically
- In-memory DB setup: <10ms per test

To optimize:
```bash
# Run tests in parallel (requires pytest-xdist)
pip install pytest-xdist
pytest test_api.py -n auto
```

## Next Steps

1. Run the full test suite: `pytest test_api.py -v`
2. Check coverage: `pytest test_api.py --cov=. --cov-report=term-missing`
3. Add tests for new endpoints as you develop
4. Keep test/code ratio healthy (aim for >80% coverage)
