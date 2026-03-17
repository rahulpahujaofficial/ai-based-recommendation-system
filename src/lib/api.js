/**
 * Centralised API client for the RecoAI backend.
 * Base URL is read from the VITE_API_BASE_URL env var (defaults to localhost:5000).
 */

// When VITE_API_BASE_URL is unset, fall back to localhost.
// Set it to an empty string ("") to use the Vite dev proxy (recommended for Codespaces).
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log(`🔗 API configured to: ${API_BASE}`)
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data
  } catch (err) {
    // Provide helpful error messages for common connection issues
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const message = `
❌ Failed to connect to backend at ${API_BASE}

Troubleshooting:
1. Make sure the backend is running: python backend/app.py
2. Check that the backend is on port 5000
3. If using environment variables, verify VITE_API_BASE_URL is set correctly
4. For Codespaces, use the full Codespace URL (https://...)

Current API Base: ${API_BASE}
`
      console.error(message)
      throw new Error(`Cannot reach backend at ${API_BASE}. Is it running?`)
    }
    console.error('API Error:', err)
    throw err
  }
}

// Helper function to get auth token
function getAuthHeaders() {
  const token = localStorage.getItem('auth_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

// ── Authentication ────────────────────────────────────────────────────────
export const authApi = {
  register: (email, password, fullName) => request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name: fullName })
  }),
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  logout: () => localStorage.removeItem('auth_token'),
  getMe: () => request('/api/auth/me', { headers: getAuthHeaders() }),
}

// ── Stores ──────────────────────────────────────────────────────────────────
export const storesApi = {
  list: () => request('/api/stores/', { headers: getAuthHeaders() }),
  get: (storeId) => request(`/api/stores/${storeId}`, { headers: getAuthHeaders() }),
  create: (body) => request('/api/stores/', { method: 'POST', body: JSON.stringify(body), headers: getAuthHeaders() }),
  update: (storeId, body) => request(`/api/stores/${storeId}`, { method: 'PUT', body: JSON.stringify(body), headers: getAuthHeaders() }),
  getSettings: (storeId) => request(`/api/stores/${storeId}/settings`, { headers: getAuthHeaders() }),
  updateSettings: (storeId, body) => request(`/api/stores/${storeId}/settings`, { method: 'PUT', body: JSON.stringify(body), headers: getAuthHeaders() }),
  deleteData: (storeId) => request(`/api/stores/${storeId}/data`, { method: 'DELETE', headers: getAuthHeaders() }),
}

// ── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (storeId, params = {}) => {
    const qs = new URLSearchParams({ store_id: storeId, ...params }).toString()
    return request(`/api/products/?${qs}`)
  },
  get: (id, storeId) => request(`/api/products/${id}?store_id=${storeId}`),
  create: (body) => request('/api/products/', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id, storeId) => request(`/api/products/${id}?store_id=${storeId}`, { method: 'DELETE' }),
  categories: (storeId) => request(`/api/products/categories?store_id=${storeId}`),
}

// ── Ingestion ────────────────────────────────────────────────────────────────
export const ingestApi = {
  csv: (storeId, file) => {
    const form = new FormData()
    form.append('store_id', storeId)
    form.append('file', file)
    return fetch(`${API_BASE}/api/ingest/csv`, { method: 'POST', body: form }).then(async (r) => {
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`)
      return d
    })
  },
  api: (storeId, apiUrl, productsKey) =>
    request('/api/ingest/api', { method: 'POST', body: JSON.stringify({ store_id: storeId, api_url: apiUrl, products_key: productsKey }) }),
  scrapeProduct: (storeId, url) =>
    request('/api/ingest/scrape/product', { method: 'POST', body: JSON.stringify({ store_id: storeId, url }) }),
  scrapeCatalog: (storeId, catalogUrl, maxProducts = 20) =>
    request('/api/ingest/scrape/catalog', { method: 'POST', body: JSON.stringify({ store_id: storeId, catalog_url: catalogUrl, max_products: maxProducts }) }),
}

// ── Recommendations ──────────────────────────────────────────────────────────
export const recsApi = {
  get: (storeId, params = {}) => {
    const qs = new URLSearchParams({ store_id: storeId, ...params }).toString()
    return request(`/api/recommendations/?${qs}`)
  },
  trending: (storeId, maxItems = 6) =>
    request(`/api/recommendations/trending?store_id=${storeId}&max_items=${maxItems}`),
  engineInfo: (storeId) => request(`/api/recommendations/engine-info?store_id=${storeId}`),
  retrain: (storeId) =>
    request('/api/recommendations/retrain', { method: 'POST', body: JSON.stringify({ store_id: storeId }) }),
  selectEngine: (storeId, engine) =>
    request('/api/recommendations/select-engine', { method: 'POST', body: JSON.stringify({ store_id: storeId, engine }) }),
  trainSklearn: (storeId) =>
    request('/api/recommendations/train-sklearn', { method: 'POST', body: JSON.stringify({ store_id: storeId }) }),
  // Returns a Blob — caller must trigger the browser download
  exportModel: async (storeId) => {
    const res = await fetch(`${API_BASE}/api/recommendations/export-model?store_id=${storeId}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${res.status}`)
    }
    return res.blob()
  },
}

// ── Widget ───────────────────────────────────────────────────────────────────
export const widgetApi = {
  getConfig: (storeId) => request(`/api/widget/config?store_id=${storeId}`),
  updateConfig: (body) => request('/api/widget/config', { method: 'PUT', body: JSON.stringify(body) }),
  embedCodes: (storeId, productId) => {
    const qs = new URLSearchParams({ store_id: storeId, ...(productId ? { product_id: productId } : {}) }).toString()
    return request(`/api/widget/embed-codes?${qs}`)
  },
  widgetUrl: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return `${API_BASE}/widget/${token}${qs ? `?${qs}` : ''}`
  },
}

// ── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  summary: (storeId, days = 30) =>
    request(`/api/analytics/summary?store_id=${storeId}&days=${days}`),
  trackEvent: (body) =>
    request('/api/analytics/event', { method: 'POST', body: JSON.stringify(body) }),
  productStats: (productId, storeId) =>
    request(`/api/analytics/products/${productId}?store_id=${storeId}`),
}

// ── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (storeId) => request(`/api/stores/${storeId}/notifications`, { headers: getAuthHeaders() }),
  markRead: (storeId, notifId) => request(`/api/stores/${storeId}/notifications/${notifId}/read`, { method: 'POST', headers: getAuthHeaders() }),
  delete: (storeId, notifId) => request(`/api/stores/${storeId}/notifications/${notifId}`, { method: 'DELETE', headers: getAuthHeaders() }),
}
