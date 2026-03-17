#!/usr/bin/env node

/**
 * API Test Runner - JavaScript Version
 * 
 * This script tests all major API endpoints from the frontend.
 * Can be run directly with Node.js
 * 
 * Usage:
 *   node src/tests/api.test.js
 *   npm run test:api
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000'
const STORE_ID = `test-store-${Date.now()}`
const SESSION_ID = `test-session-${Date.now()}`

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[2m',
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(color = 'reset', ...args) {
  console.log(`${colors[color]}${args.join(' ')}${colors.reset}`)
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json().catch(() => ({}))
    return { data, status: response.status, headers: response.headers }
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`)
  }
}

function printResult(result) {
  const icon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '⊘'
  const color = result.status === 'PASS' ? 'green' : result.status === 'FAIL' ? 'red' : 'yellow'
  
  log(color, `${icon} ${result.name} (${result.duration}ms)`)
  
  if (result.message) {
    log('cyan', `  └─ ${result.message}`)
  }
  
  if (result.error && process.env.DEBUG) {
    log('red', `  └─ Error: ${result.error.message}`)
  }
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testHealthCheck() {
  const startTime = Date.now()
  try {
    const { data, status } = await apiRequest('/api/health')
    
    if (status !== 200) {
      throw new Error(`Expected status 200, got ${status}`)
    }
    
    if (!data.status || data.status !== 'ok') {
      throw new Error('Health check did not return ok status')
    }
    
    return {
      name: 'Health Check',
      status: 'PASS',
      message: `Backend is healthy (v${data.version})`,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: 'Health Check',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - startTime,
      error,
    }
  }
}

async function testStoreCreation() {
  const startTime = Date.now()
  try {
    const storeData = {
      store_id: STORE_ID,
      name: 'Test Store',
      domain: 'test.example.com',
    }
    
    const { data, status } = await apiRequest('/api/stores/', {
      method: 'POST',
      body: JSON.stringify(storeData),
    })
    
    if (status !== 201) {
      throw new Error(`Expected status 201, got ${status}`)
    }
    
    if (!data.store_id) {
      throw new Error('Store creation did not return store_id')
    }
    
    return {
      result: {
        name: 'Store Creation',
        status: 'PASS',
        message: `Created store: ${data.store_id}`,
        duration: Date.now() - startTime,
      },
      storeId: data.store_id,
    }
  } catch (error) {
    return {
      result: {
        name: 'Store Creation',
        status: 'FAIL',
        message: error.message,
        duration: Date.now() - startTime,
        error,
      },
    }
  }
}

async function testGetStore(storeId) {
  const startTime = Date.now()
  try {
    const { data, status } = await apiRequest(`/api/stores/${storeId}`)
    
    if (status !== 200) {
      throw new Error(`Expected status 200, got ${status}`)
    }
    
    if (!data.store_id) {
      throw new Error('Get store did not return store_id')
    }
    
    return {
      name: 'Get Store',
      status: 'PASS',
      message: `Retrieved store: ${data.name}`,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: 'Get Store',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - startTime,
      error,
    }
  }
}

async function testProductCreation(storeId) {
  const startTime = Date.now()
  try {
    const productData = {
      store_id: storeId,
      name: 'Test Product',
      description: 'A test product for API testing',
      category: 'Electronics',
      price: 99.99,
      image_url: 'https://example.com/image.jpg',
      rating: 4.5,
      stock: 10,
    }
    
    const { data, status } = await apiRequest('/api/products/', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
    
    if (status !== 201) {
      throw new Error(`Expected status 201, got ${status}`)
    }
    
    if (!data.id) {
      throw new Error('Product creation did not return id')
    }
    
    return {
      result: {
        name: 'Product Creation',
        status: 'PASS',
        message: `Created product: ${data.name} ($${data.price})`,
        duration: Date.now() - startTime,
      },
      productId: data.id,
    }
  } catch (error) {
    return {
      result: {
        name: 'Product Creation',
        status: 'FAIL',
        message: error.message,
        duration: Date.now() - startTime,
        error,
      },
    }
  }
}

async function testListProducts(storeId) {
  const startTime = Date.now()
  try {
    const { data, status } = await apiRequest(
      `/api/products/?store_id=${storeId}&page=1&per_page=10`
    )
    
    if (status !== 200) {
      throw new Error(`Expected status 200, got ${status}`)
    }
    
    if (!Array.isArray(data.products)) {
      throw new Error('List products did not return products array')
    }
    
    return {
      name: 'List Products',
      status: 'PASS',
      message: `Retrieved ${data.products.length} products (total: ${data.total})`,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: 'List Products',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - startTime,
      error,
    }
  }
}

async function testGetProduct(storeId, productId) {
  const startTime = Date.now()
  try {
    const { data, status } = await apiRequest(
      `/api/products/${productId}?store_id=${storeId}`
    )
    
    if (status !== 200) {
      throw new Error(`Expected status 200, got ${status}`)
    }
    
    if (!data.id) {
      throw new Error('Get product did not return id')
    }
    
    return {
      name: 'Get Product',
      status: 'PASS',
      message: `Retrieved product: ${data.name}`,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: 'Get Product',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - startTime,
      error,
    }
  }
}

async function testUpdateProduct(storeId, productId) {
  const startTime = Date.now()
  try {
    const updateData = {
      store_id: storeId,
      name: 'Updated Test Product',
      price: 149.99,
    }
    
    const { data, status } = await apiRequest(
      `/api/products/${productId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    )
    
    if (status !== 200) {
      throw new Error(`Expected status 200, got ${status}`)
    }
    
    if (data.price !== 149.99) {
      throw new Error('Product update did not persist price change')
    }
    
    return {
      name: 'Update Product',
      status: 'PASS',
      message: `Updated product: ${data.name} ($${data.price})`,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: 'Update Product',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - startTime,
      error,
    }
  }
}

async function testAnalyticsTracking(storeId, productId) {
  const startTime = Date.now()
  try {
    const eventData = {
      store_id: storeId,
      session_id: SESSION_ID,
      product_id: productId,
      event_type: 'view',
    }
    
    const { data, status } = await apiRequest('/api/analytics/event', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
    
    if (status !== 201) {
      throw new Error(`Expected status 201, got ${status}`)
    }
    
    return {
      name: 'Analytics Event Tracking',
      status: 'PASS',
      message: 'Successfully tracked view event',
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: 'Analytics Event Tracking',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - startTime,
      error,
    }
  }
}

async function testGetRecommendations(storeId) {
  const startTime = Date.now()
  try {
    const { data, status } = await apiRequest(
      `/api/recommendations/trending?store_id=${storeId}&max_items=6`
    )
    
    if (status !== 200) {
      throw new Error(`Expected status 200, got ${status}`)
    }
    
    if (!Array.isArray(data.recommendations)) {
      throw new Error('Get recommendations did not return recommendations array')
    }
    
    return {
      name: 'Get Recommendations',
      status: 'PASS',
      message: `Retrieved ${data.recommendations.length} recommendations`,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: 'Get Recommendations',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - startTime,
      error,
    }
  }
}

async function testWidgetConfig(storeId) {
  const startTime = Date.now()
  try {
    const { data, status } = await apiRequest(
      `/api/widget/config?store_id=${storeId}`
    )
    
    if (status !== 200) {
      throw new Error(`Expected status 200, got ${status}`)
    }
    
    if (!data.widget_token) {
      throw new Error('Widget config did not return widget_token')
    }
    
    return {
      name: 'Widget Configuration',
      status: 'PASS',
      message: `Retrieved widget config (token: ${data.widget_token.substring(0, 8)}...)`,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: 'Widget Configuration',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - startTime,
      error,
    }
  }
}

async function testAnalyticsSummary(storeId) {
  const startTime = Date.now()
  try {
    const { data, status } = await apiRequest(
      `/api/analytics/summary?store_id=${storeId}&days=30`
    )
    
    if (status !== 200) {
      throw new Error(`Expected status 200, got ${status}`)
    }
    
    return {
      name: 'Analytics Summary',
      status: 'PASS',
      message: 'Retrieved analytics summary',
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: 'Analytics Summary',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - startTime,
      error,
    }
  }
}

async function testDeleteProduct(storeId, productId) {
  const startTime = Date.now()
  try {
    const { status } = await apiRequest(
      `/api/products/${productId}?store_id=${storeId}`,
      { method: 'DELETE' }
    )
    
    if (status !== 200) {
      throw new Error(`Expected status 200, got ${status}`)
    }
    
    return {
      name: 'Delete Product',
      status: 'PASS',
      message: 'Successfully deleted product',
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name: 'Delete Product',
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - startTime,
      error,
    }
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  log('bright', '\n╔════════════════════════════════════════════════════╗')
  log('bright', '║  RecoAI Backend API Test Suite                    ║')
  log('bright', '╚════════════════════════════════════════════════════╝\n')
  
  log('cyan', `API Base URL: ${API_BASE_URL}`)
  log('cyan', `Store ID: ${STORE_ID}`)
  log('cyan', `Session ID: ${SESSION_ID}\n`)
  
  const results = []
  let storeId
  let productId
  
  try {
    // Test 1: Health Check
    log('bright', '▶ Health & Connectivity Checks')
    let result = await testHealthCheck()
    printResult(result)
    results.push(result)
    
    if (result.status === 'FAIL') {
      log('red', '\n❌ Backend is not reachable. Stopping tests.')
      return results
    }
    
    // Test 2: Store Operations
    log('bright', '\n▶ Store Operations')
    const storeCreationResult = await testStoreCreation()
    printResult(storeCreationResult.result)
    results.push(storeCreationResult.result)
    storeId = storeCreationResult.storeId
    
    if (storeId) {
      result = await testGetStore(storeId)
      printResult(result)
      results.push(result)
    }
    
    // Test 3: Product Operations
    if (storeId) {
      log('bright', '\n▶ Product Operations')
      const productCreationResult = await testProductCreation(storeId)
      printResult(productCreationResult.result)
      results.push(productCreationResult.result)
      productId = productCreationResult.productId
      
      if (productId) {
        result = await testGetProduct(storeId, productId)
        printResult(result)
        results.push(result)
        
        result = await testUpdateProduct(storeId, productId)
        printResult(result)
        results.push(result)
        
        result = await testListProducts(storeId)
        printResult(result)
        results.push(result)
      }
    }
    
    // Test 4: Analytics
    if (storeId && productId) {
      log('bright', '\n▶ Analytics')
      result = await testAnalyticsTracking(storeId, productId)
      printResult(result)
      results.push(result)
      
      result = await testAnalyticsSummary(storeId)
      printResult(result)
      results.push(result)
    }
    
    // Test 5: Recommendations
    if (storeId) {
      log('bright', '\n▶ Recommendations')
      result = await testGetRecommendations(storeId)
      printResult(result)
      results.push(result)
    }
    
    // Test 6: Widget
    if (storeId) {
      log('bright', '\n▶ Widget')
      result = await testWidgetConfig(storeId)
      printResult(result)
      results.push(result)
    }
    
    // Test 7: Cleanup
    if (storeId && productId) {
      log('bright', '\n▶ Cleanup')
      result = await testDeleteProduct(storeId, productId)
      printResult(result)
      results.push(result)
    }
    
  } catch (error) {
    log('red', `\n❌ Unexpected error: ${error.message}`)
  }
  
  // Summary
  log('bright', '\n▶ Test Summary')
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const total = results.length
  const duration = results.reduce((sum, r) => sum + r.duration, 0)
  
  log('bright', `\nResults: ${passed}/${total} passed, ${failed} failed`)
  log('bright', `Total Duration: ${duration}ms\n`)
  
  if (failed === 0) {
    log('green', '✓ All tests passed!\n')
  } else {
    log('red', `✗ ${failed} test(s) failed.\n`)
  }
  
  return results
}

// ============================================================================
// EXECUTION
// ============================================================================

runAllTests()
  .then(results => {
    const failed = results.filter(r => r.status === 'FAIL').length
    process.exit(failed > 0 ? 1 : 0)
  })
  .catch(error => {
    log('red', `Fatal error: ${error.message}`)
    process.exit(1)
  })

export { runAllTests, apiRequest, API_BASE_URL }
