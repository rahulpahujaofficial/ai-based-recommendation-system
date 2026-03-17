import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Plus, Upload, Grid3X3, List, Star, Package,
  Trash2, Edit2, Eye, CheckCircle2, Clock, X, Save, Archive, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatNumber, cn } from '@/lib/utils'
import { productsApi, ingestApi } from '@/lib/api'
import { useStore } from '@/context/StoreContext'

// ═══════════════════════════════════════════════════════════════════════════════
// ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format tags from various input types to array
 */
const formatTags = (tags) => {
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean)
  return []
}

/**
 * Parse tags from comma-separated string
 */
const parseTagsFromForm = (tagsString) => {
  return tagsString.split(',').map(t => t.trim()).filter(Boolean)
}

/**
 * Validate product form data
 */
const validateProductForm = (form) => {
  if (!form.name?.trim()) return 'Product name is required'
  if (form.price && isNaN(parseFloat(form.price))) return 'Price must be a valid number'
  if (form.stock && isNaN(parseInt(form.stock))) return 'Stock must be a valid number'
  return null
}

/**
 * Calculate conversion rate percentage
 */
const calculateConversionRate = (clicks, conversions) => {
  if (!clicks || clicks === 0) return 0
  return ((conversions || 0) / clicks) * 100
}

/**
 * Build payload for product API requests
 */
const buildProductPayload = (form, storeId) => {
  return {
    ...form,
    store_id: storeId,
    price: form.price ? parseFloat(form.price) : null,
    stock: parseInt(form.stock) || 0,
    tags: parseTagsFromForm(form.tags)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PRODUCT CARD COMPONENT ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function ProductCard({ product, view, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false)
  const p = product
  const conversionRate = useMemo(() => calculateConversionRate(p.click_count, p.conversion_count), [p.click_count, p.conversion_count])

  if (view === 'list') {
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 p-4 rounded-xl glass-card hover:border-white/15 transition-all group">
        {p.image_url
          ? <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
          : <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0"><Package size={20} className="text-white/20" /></div>
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-medium text-white truncate">{p.name}</p>
            <Badge
              variant={p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'secondary'}
              className="text-[10px] py-0 shrink-0">
              {p.status}
            </Badge>
          </div>
          <p className="text-xs text-white/40">{p.category} · {p.stock} in stock</p>
        </div>
        <div className="hidden md:flex items-center gap-6 text-center">
          <div><p className="text-sm font-semibold text-white">{formatNumber(p.click_count || 0)}</p><p className="text-xs text-white/30">Clicks</p></div>
          <div><p className="text-sm font-semibold text-emerald-400">{p.conversion_count || 0}</p><p className="text-xs text-white/30">Converts</p></div>
          <div><p className="text-sm font-semibold text-white">{formatPrice(p.price)}</p><p className="text-xs text-white/30">Price</p></div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-white/40" onClick={() => onEdit(p)}><Edit2 size={13} /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 text-red-400/60 hover:text-red-400" onClick={() => onDelete(p.id)}><Trash2 size={13} /></Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card-hover rounded-2xl overflow-hidden group"
      onMouseEnter={() => setShowActions(true)} onMouseLeave={() => setShowActions(false)}>
      <div className="relative aspect-square overflow-hidden bg-white/5">
        {p.image_url
          ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={40} className="text-white/10" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge
            variant={p.status === 'active' ? 'success' : p.status === 'draft' ? 'warning' : 'secondary'}
            className="text-[10px]">
            {p.status === 'active' && <CheckCircle2 size={9} className="mr-1" />}
            {p.status === 'draft' && <FileText size={9} className="mr-1" />}
            {p.status === 'archived' && <Archive size={9} className="mr-1" />}
            {p.status}
          </Badge>
        </div>
        <div className={cn('absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200', showActions ? 'opacity-100' : 'opacity-0')}>
          <Button variant="glass" size="sm" className="text-xs h-8" onClick={() => onEdit(p)}><Edit2 size={12} /> Edit</Button>
          <Button variant="glass" size="sm" className="text-xs h-8 text-red-400" onClick={() => onDelete(p.id)}><Trash2 size={12} /></Button>
        </div>
        {p.rating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-white font-medium">{p.rating}</span>
            <span className="text-xs text-white/60">({formatNumber(p.review_count || 0)})</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-violet-400 font-medium mb-1">{p.category}</p>
        <p className="text-sm font-semibold text-white mb-2 leading-snug line-clamp-2">{p.name}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-bold text-white">{formatPrice(p.price)}</span>
          <div className="text-right">
            <p className="text-xs font-semibold text-emerald-400">{formatNumber(p.click_count || 0)} clicks</p>
            <p className="text-[10px] text-white/30">{p.conversion_count || 0} sales</p>
          </div>
        </div>
        {p.click_count > 0 && (
          <>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                style={{ width: `${Math.min(100, conversionRate)}%` }} />
            </div>
            <p className="text-[10px] text-white/30 mt-1">{conversionRate.toFixed(1)}% conversion rate</p>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PRODUCT MODAL (ADD/EDIT) ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function ProductModal({ product, storeId, onClose, onSaved }) {
  const isEdit = !!product
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || '',
    image_url: product?.image_url || '',
    product_url: product?.product_url || '',
    tags: formatTags(product?.tags).join(', ') || '',
    stock: product?.stock || 0,
    status: product?.status || 'active',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  /**
   * Handle form field changes
   */
  const handleFieldChange = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (error) setError('')
  }, [error])

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const validationError = validateProductForm(form)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = buildProductPayload(form, storeId)
      if (isEdit) {
        await productsApi.update(product.id, payload)
      } else {
        await productsApi.create(payload)
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }, [form, storeId, isEdit, product?.id, onSaved])

  /**
   * Render form field
   */
  const renderField = useCallback((key, label, type = 'text', hint) => (
    <div>
      <Label className="text-xs mb-1.5 block">{label}</Label>
      <Input type={type} value={form[key]} onChange={(e) => handleFieldChange(key, e.target.value)} placeholder={hint} disabled={saving} />
    </div>
  ), [form, saving, handleFieldChange])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 max-w-lg w-full border border-white/10 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{isEdit ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10" disabled={saving}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {renderField('name', 'Product Name *', 'text', 'e.g. Premium Wireless Headphones')}
          <div className="grid grid-cols-2 gap-3">
            {renderField('price', 'Price ($)', 'number', '29.99')}
            {renderField('stock', 'Stock', 'number', '100')}
          </div>
          {renderField('category', 'Category', 'text', 'Electronics, Fashion…')}
          {renderField('tags', 'Tags (comma-separated)', 'text', 'wireless, bluetooth, audio')}
          {renderField('image_url', 'Image URL', 'url', 'https://example.com/image.jpg')}
          {renderField('product_url', 'Product URL', 'url', 'https://mystore.com/products/…')}
          <div>
            <Label className="text-xs mb-1.5 block">Description</Label>
            <textarea value={form.description} onChange={(e) => handleFieldChange('description', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 resize-none disabled:opacity-50" rows={3} disabled={saving} />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Status</Label>
            <select value={form.status} onChange={(e) => handleFieldChange('status', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 disabled:opacity-50" disabled={saving}>
              <option value="active" className="bg-gray-900">Active</option>
              <option value="draft" className="bg-gray-900">Draft</option>
              <option value="archived" className="bg-gray-900">Archived</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="glow" className="flex-1" disabled={saving}>
              {saving ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
                : <><Save size={13} /> {isEdit ? 'Update' : 'Create'}</>}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── IMPORT MODAL (CSV/API/SCRAPE) ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function ImportModal({ storeId, onClose, onImported }) {
  const [tab, setTab] = useState('csv')
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [apiUrl, setApiUrl] = useState('')
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scrapeType, setScrapeType] = useState('product')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()

  /**
   * Handle file drop
   */
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.csv')) {
      setFile(f)
      setError('')
    } else {
      setError('Please select a valid CSV file')
    }
  }, [])

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((e) => {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      setError('')
    }
  }, [])

  /**
   * Validate import inputs
   */
  const validateImportInputs = useCallback(() => {
    if (tab === 'csv' && !file) {
      setError('Please select a CSV file')
      return false
    } else if (tab === 'api' && !apiUrl.trim()) {
      setError('API URL is required')
      return false
    } else if (tab === 'scrape' && !scrapeUrl.trim()) {
      setError('URL is required')
      return false
    }
    return true
  }, [tab, file, apiUrl, scrapeUrl])

  /**
   * Handle import
   */
  const handleImport = useCallback(async () => {
    if (!validateImportInputs()) return
    setLoading(true)
    setError('')
    try {
      let res
      if (tab === 'csv') {
        res = await ingestApi.csv(storeId, file)
      } else if (tab === 'api') {
        res = await ingestApi.api(storeId, apiUrl, 'products')
      } else {
        res = scrapeType === 'product'
          ? await ingestApi.scrapeProduct(storeId, scrapeUrl)
          : await ingestApi.scrapeCatalog(storeId, scrapeUrl, 20)
      }
      setResult(res)
      onImported()
    } catch (err) {
      setError(err.message || 'Import failed')
    } finally {
      setLoading(false)
    }
  }, [tab, file, apiUrl, scrapeUrl, scrapeType, storeId, validateImportInputs, onImported])

  if (result) {
    const count = result.inserted ?? result.products_found ?? 1
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 max-w-md w-full border border-white/10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-1">Import Successful!</h4>
          <p className="text-sm text-white/50 mb-2">{count} product{count !== 1 ? 's' : ''} processed.</p>
          {result.errors > 0 && <p className="text-xs text-amber-400 mb-4">{result.errors} row{result.errors !== 1 ? 's' : ''} had errors.</p>}
          <Button variant="glow" onClick={onClose}>Done</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 max-w-lg w-full border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Import Products</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10" disabled={loading}><X size={16} /></button>
        </div>
        <div className="flex gap-2 mb-5">
          {[['csv', 'CSV Upload'], ['api', 'API / Shopify'], ['scrape', 'Web Scrape']].map(([id, label]) => (
            <button key={id} onClick={() => { setTab(id); setError('') }} disabled={loading}
              className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50', tab === id ? 'bg-violet-600 text-white' : 'glass-card text-white/50 hover:text-white')}>
              {label}
            </button>
          ))}
        </div>
        {tab === 'csv' && (
          <>
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn('border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 mb-4 cursor-pointer',
                dragOver ? 'border-violet-400 bg-violet-500/10' : 'border-white/15 hover:border-white/25')}>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} disabled={loading} />
              <Upload size={28} className="text-white/30 mx-auto mb-2" />
              {file ? <p className="text-sm text-emerald-400 font-medium">✓ {file.name}</p>
                : <><p className="text-sm font-medium text-white mb-1">Drop CSV file here or click to browse</p>
                  <p className="text-xs text-white/40">Shopify exports, custom CSV · Max 16 MB</p></>}
            </div>
            <p className="text-xs text-white/40 mb-4">Required: <code className="text-violet-300">name</code>. Optional: category, price, image_url, product_url, tags, stock, description</p>
          </>
        )}
        {tab === 'api' && (
          <div className="mb-4 space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">JSON API URL</Label>
              <Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://mystore.myshopify.com/products.json" disabled={loading} />
            </div>
            <p className="text-xs text-white/40">Works with Shopify JSON feeds (<code className="text-violet-300">/products.json</code>) and any public JSON product API.</p>
          </div>
        )}
        {tab === 'scrape' && (
          <div className="mb-4 space-y-3">
            <div className="flex gap-2 mb-2">
              {[['product', 'Single Product'], ['catalog', 'Catalog Page']].map(([id, label]) => (
                <button key={id} onClick={() => setScrapeType(id)} disabled={loading}
                  className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50', scrapeType === id ? 'bg-violet-600 text-white' : 'glass-card text-white/50 hover:text-white')}>
                  {label}
                </button>
              ))}
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">{scrapeType === 'product' ? 'Product Page URL' : 'Catalog / Collection URL'}</Label>
              <Input value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} placeholder={scrapeType === 'product' ? 'https://store.com/products/headphones' : 'https://store.com/collections/all'} disabled={loading} />
            </div>
            <p className="text-xs text-white/40">{scrapeType === 'product' ? 'Scrapes a single product page.' : 'Finds all product links on the page and scrapes each (up to 20).'}</p>
          </div>
        )}
        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{error}</p>}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="glow" className="flex-1" onClick={handleImport} disabled={loading}>
            {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importing…</span>
              : 'Import Products'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DELETE CONFIRMATION MODAL ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function DeleteConfirm({ productId, storeId, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)

  /**
   * Handle product deletion
   */
  const handleDelete = useCallback(async () => {
    setDeleting(true)
    try {
      await productsApi.delete(productId, storeId)
      onDeleted()
    } catch (_) {
      setDeleting(false)
    }
  }, [productId, storeId, onDeleted])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 max-w-sm w-full border border-red-500/20 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">Delete Product?</h3>
        <p className="text-xs text-white/50 mb-5">This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" className="flex-1 bg-red-900/50 text-red-400 border border-red-500/30 hover:bg-red-900/70" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN PRODUCTS PAGE COMPONENT ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProductsPage() {
  const { storeId, refreshStore } = useStore()

  // State: Products and categories
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [total, setTotal] = useState(0)

  // State: Filters and view
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeStatus, setActiveStatus] = useState('active')  // 'active', 'draft', 'archived'
  const [view, setView] = useState('grid')

  // State: Loading and modals
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────────
  // Data Fetching Functions
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetch products from API with current filters
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 20, status: activeStatus }
      if (search) params.q = search
      if (activeCategory !== 'All') params.category = activeCategory

      const data = await productsApi.list(storeId, params)
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
    setLoading(false)
  }, [storeId, page, search, activeCategory, activeStatus])

  /**
   * Fetch categories for filter
   */
  const fetchCategories = useCallback(async () => {
    try {
      const data = await productsApi.categories(storeId)
      setCategories(['All', ...(data.categories || [])])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }, [storeId])

  // ─────────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Handle search input
   */
  const handleSearch = useCallback((val) => {
    setSearch(val)
    setPage(1)
  }, [])

  /**
   * Handle category filter change
   */
  const handleCategory = useCallback((cat) => {
    setActiveCategory(cat)
    setPage(1)
  }, [])

  /**
   * Handle status filter change
   */
  const handleStatus = useCallback((status) => {
    setActiveStatus(status)
    setPage(1)
  }, [])

  /**
   * Handle successful product save
   */
  const handleAfterSave = useCallback(() => {
    setEditProduct(null)
    setShowAdd(false)
    fetchProducts()
    fetchCategories()
    refreshStore()
  }, [fetchProducts, fetchCategories, refreshStore])

  /**
   * Handle successful product deletion
   */
  const handleAfterDelete = useCallback(() => {
    setDeleteId(null)
    fetchProducts()
    refreshStore()
  }, [fetchProducts, refreshStore])

  /**
   * Handle successful import
   */
  const handleAfterImport = useCallback(() => {
    fetchProducts()
    fetchCategories()
    refreshStore()
  }, [fetchProducts, fetchCategories, refreshStore])

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchCategories()
  }, [storeId, fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [storeId, page, search, activeCategory, fetchProducts])

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-white/40 text-sm mt-1">{total} products in your AI catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}><Upload size={14} /> Import</Button>
          <Button variant="glow" size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Product</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input placeholder="Search products…" className="pl-9 h-9" value={search}
            onChange={(e) => handleSearch(e.target.value)} />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
            {categories.map((cat) => (
              <button key={cat} onClick={() => handleCategory(cat)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer',
                  activeCategory === cat ? 'bg-violet-600 text-white' : 'glass-card text-white/50 hover:text-white')}>
                {cat}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1 border-l border-white/10 pl-3">
            {[
              { id: 'active', label: 'Active', icon: CheckCircle2 },
              { id: 'draft', label: 'Draft', icon: FileText },
              { id: 'archived', label: 'Archived', icon: Archive },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleStatus(id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5',
                  activeStatus === id
                    ? id === 'active' ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                      : id === 'draft' ? 'bg-amber-600/20 border border-amber-500/30 text-amber-400'
                      : 'bg-slate-600/20 border border-slate-500/30 text-slate-400'
                    : 'glass-card text-white/50 hover:text-white',
                )}>
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 glass-card rounded-lg p-1 shrink-0">
          <button onClick={() => setView('grid')} className={cn('p-1.5 rounded cursor-pointer transition-colors', view === 'grid' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white')}><Grid3X3 size={14} /></button>
          <button onClick={() => setView('list')} className={cn('p-1.5 rounded cursor-pointer transition-colors', view === 'list' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white')}><List size={14} /></button>
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-16 text-white/30 text-sm">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm mb-4">No products found</p>
          <Button variant="glow" size="sm" onClick={() => setShowImport(true)}><Upload size={13} /> Import Products</Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} view="grid" onEdit={setEditProduct} onDelete={setDeleteId} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => <ProductCard key={p.id} product={p} view="list" onEdit={setEditProduct} onDelete={setDeleteId} />)}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <span className="text-xs text-white/40">Page {page} · {total} total</span>
          <Button variant="outline" size="sm" disabled={products.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Modals */}
      {showAdd && <ProductModal storeId={storeId} onClose={() => setShowAdd(false)} onSaved={handleAfterSave} />}
      {editProduct && <ProductModal product={editProduct} storeId={storeId} onClose={() => setEditProduct(null)} onSaved={handleAfterSave} />}
      {deleteId && <DeleteConfirm productId={deleteId} storeId={storeId} onClose={() => setDeleteId(null)} onDeleted={handleAfterDelete} />}
      {showImport && <ImportModal storeId={storeId} onClose={() => setShowImport(false)} onImported={handleAfterImport} />}
    </div>
  )
}
