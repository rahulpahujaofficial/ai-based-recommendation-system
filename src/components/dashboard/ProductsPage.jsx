import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Upload, Filter, Grid3X3, List, Star, TrendingUp, Package, MoreHorizontal, Trash2, Edit2, Eye, CheckCircle2, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MOCK_PRODUCTS } from '@/data/mockData'
import { formatPrice, formatNumber, cn } from '@/lib/utils'

const categories = ['All', 'Electronics', 'Fashion', 'Beauty', 'Home', 'Sports', 'Lifestyle']

function ProductCard({ product, view }) {
  const [showActions, setShowActions] = useState(false)

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 p-4 rounded-xl glass-card hover:border-white/15 transition-all group"
      >
        <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-medium text-white truncate">{product.name}</p>
            <Badge variant={product.status === 'active' ? 'success' : 'warning'} className="text-[10px] py-0 shrink-0">
              {product.status}
            </Badge>
          </div>
          <p className="text-xs text-white/40">{product.category} · {product.stock} in stock</p>
        </div>
        <div className="hidden md:flex items-center gap-6 text-center">
          <div>
            <p className="text-sm font-semibold text-white">{formatNumber(product.clicks)}</p>
            <p className="text-xs text-white/30">Clicks</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-400">{product.conversions}</p>
            <p className="text-xs text-white/30">Converts</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{formatPrice(product.price)}</p>
            <p className="text-xs text-white/30">Price</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-white/40"><Eye size={13} /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 text-white/40"><Edit2 size={13} /></Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 text-red-400/60 hover:text-red-400"><Trash2 size={13} /></Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card-hover rounded-2xl overflow-hidden group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-white/5">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={product.status === 'active' ? 'success' : 'warning'} className="text-[10px]">
            {product.status === 'active' ? <CheckCircle2 size={9} className="mr-1" /> : <Clock size={9} className="mr-1" />}
            {product.status}
          </Badge>
        </div>

        {/* Actions overlay */}
        <div className={cn('absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200', showActions ? 'opacity-100' : 'opacity-0')}>
          <Button variant="glass" size="sm" className="text-xs h-8"><Eye size={12} /> Preview</Button>
          <Button variant="glass" size="sm" className="text-xs h-8"><Edit2 size={12} /> Edit</Button>
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          <span className="text-xs text-white font-medium">{product.rating}</span>
          <span className="text-xs text-white/60">({formatNumber(product.reviews)})</span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-violet-400 font-medium mb-1">{product.category}</p>
        <p className="text-sm font-semibold text-white mb-2 leading-snug line-clamp-2">{product.name}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-end gap-1.5">
            <span className="text-base font-bold text-white">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-white/30 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-emerald-400">{formatNumber(product.clicks)} clicks</p>
            <p className="text-[10px] text-white/30">{product.conversions} sales</p>
          </div>
        </div>

        <div className="w-full bg-white/5 rounded-full h-1.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
            style={{ width: `${Math.min(100, (product.conversions / product.clicks) * 1000)}%` }}
          />
        </div>
        <p className="text-[10px] text-white/30 mt-1">
          {((product.conversions / product.clicks) * 100).toFixed(1)}% conversion rate
        </p>
      </div>
    </motion.div>
  )
}

function UploadModal({ onClose }) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const handleUpload = () => {
    setUploading(true)
    setTimeout(() => { setUploading(false); setUploaded(true) }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 max-w-lg w-full border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Import Products</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        {uploaded ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-1">Upload Successful!</h4>
            <p className="text-sm text-white/50 mb-6">8 products imported. AI is now training on your catalog.</p>
            <Button variant="glow" onClick={onClose}>View Products</Button>
          </div>
        ) : (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              className={cn(
                'border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 mb-6',
                dragOver ? 'border-violet-400 bg-violet-500/10' : 'border-white/15 hover:border-white/25'
              )}
            >
              <Upload size={32} className="text-white/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-white mb-1">Drop your CSV file here</p>
              <p className="text-xs text-white/40 mb-4">Supports Shopify product exports, CSV, JSON</p>
              <Button variant="outline" size="sm">Browse Files</Button>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Or connect directly</p>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl glass-card hover:border-white/20 transition-all text-left">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Package size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Shopify Store</p>
                  <p className="text-xs text-white/40">Import all products automatically</p>
                </div>
                <Badge variant="success" className="ml-auto text-[10px]">Recommended</Badge>
              </button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button variant="glow" className="flex-1" onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</span>
                ) : (
                  'Import Products'
                )}
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [view, setView] = useState('grid')
  const [showUpload, setShowUpload] = useState(false)

  const filtered = MOCK_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-white/40 text-sm mt-1">{MOCK_PRODUCTS.length} products in your AI catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
            <Upload size={14} /> Import CSV
          </Button>
          <Button variant="glow" size="sm" onClick={() => setShowUpload(true)}>
            <Plus size={14} /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Search products..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer',
                activeCategory === cat
                  ? 'bg-violet-600 text-white'
                  : 'glass-card text-white/50 hover:text-white'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 glass-card rounded-lg p-1">
          <button
            onClick={() => setView('grid')}
            className={cn('p-1.5 rounded cursor-pointer transition-colors', view === 'grid' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white')}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('p-1.5 rounded cursor-pointer transition-colors', view === 'list' ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white')}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Products */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} view="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} view="list" />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Package size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No products found</p>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}
