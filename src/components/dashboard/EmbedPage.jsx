import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Code2, Copy, Check, Eye, Palette, LayoutTemplate, ExternalLink,
  Zap, Grid2x2, List, Rows, RefreshCw, Save, Sparkles, Brain, Settings2,
  Home, Package2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { widgetApi, productsApi } from '@/lib/api'
import { useStore } from '@/context/StoreContext'
import { API_BASE } from '@/lib/api'

const WIDGET_TYPES = [
  { id: 'carousel', label: 'Carousel',  icon: Rows,    desc: 'Horizontal scrolling product row'  },
  { id: 'grid',     label: 'Grid',      icon: Grid2x2, desc: '2×N responsive product grid'       },
  { id: 'list',     label: 'List',      icon: List,    desc: 'Compact vertical product list'      },
]

const MAX_ITEMS_OPTS = ['2', '3', '4', '6', '8', '12']

// ── Reusable code block with copy button ──────────────────────────────────────
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10">
        <Button variant="glass" size="sm" className="h-7 text-xs gap-1.5" onClick={copy}>
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="bg-black/60 border border-white/10 rounded-xl p-5 pt-4 text-xs text-white/80 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ── Generate embed codes from current settings + absolute widget base URL ─────
function buildEmbedCodes(widgetBaseUrl, { theme, widgetType, maxItems, primaryColor }, productId = null) {
  if (!widgetBaseUrl) return null

  const qs = new URLSearchParams({
    theme,
    type:          widgetType,
    max_items:     maxItems,
    primary_color: primaryColor,
  })
  if (productId) {
    qs.set('product_id', productId)
  }

  const fullUrl = `${widgetBaseUrl}?${qs.toString()}`

  const resizeSnippet = `
    window.addEventListener('message', function(e) {
      if (e.data && e.data.recoai_height) { iframe.style.height = e.data.recoai_height + 'px'; }
    });`

  const iframeAttrs = `    iframe.style.cssText = 'width:100%;border:none;min-height:340px;display:block';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', 'RecoAI Recommendations');`

  const scriptTag = `<!-- RecoAI Widget -->
<div id="recoai-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${fullUrl}';
${iframeAttrs}
    document.getElementById('recoai-widget').appendChild(iframe);${resizeSnippet}
  })();
<\/script>`

  const iframeTag = `<iframe
  src="${fullUrl}"
  style="width:100%;border:none;min-height:340px;display:block"
  scrolling="no"
  frameborder="0"
  title="RecoAI Recommendations"
></iframe>`

  const liquidCode = `{%- comment -%} RecoAI Widget · personalised recs on every product page {%- endcomment -%}
<div id="recoai-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${fullUrl}${productId ? '' : '&product_id={{ product.id }}'}';
${iframeAttrs}
    document.getElementById('recoai-widget').appendChild(iframe);${resizeSnippet}
  })();
<\/script>`

  return { script_tag: scriptTag, iframe_tag: iframeTag, liquid_code: liquidCode }
}

// ── EmbedPage ─────────────────────────────────────────────────────────────────
export default function EmbedPage() {
  const { storeId } = useStore()
  const [activeTab,     setActiveTab]     = useState('builder')
  const [config,        setConfig]        = useState(null)
  const [widgetBaseUrl, setWidgetBaseUrl] = useState('')   // absolute URL (from backend env)
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [saved,         setSaved]         = useState(false)

  // ── Builder state ──────────────────────────────────────────────────────────
  const [widgetType,   setWidgetType]   = useState('carousel')
  const [theme,        setTheme]        = useState('dark')
  const [maxItems,     setMaxItems]     = useState('6')
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6')
  const [widgetTitle,  setWidgetTitle]  = useState('Recommended For You')
  const [enginePref,   setEnginePref]   = useState('gemini')

  // ── Embed type state ───────────────────────────────────────────────────────
  const [embedType,        setEmbedType]        = useState('home')  // 'home' or 'product'
  const [selectedProduct,  setSelectedProduct]  = useState(null)    // selected product for product-specific embeds
  const [products,         setProducts]         = useState([])      // all products for selector

  // ── Auto-resize iframe from widget postMessage ─────────────────────────────
  const iframeRef = useRef(null)
  useEffect(() => {
    const handle = (e) => {
      if (e.data?.recoai_height && iframeRef.current) {
        iframeRef.current.style.height = `${e.data.recoai_height}px`
      }
    }
    window.addEventListener('message', handle)
    return () => window.removeEventListener('message', handle)
  }, [])

  // ── Load config + embed-code base URL ─────────────────────────────────────
  const load = async () => {
    setLoading(true)
    try {
      const [configRes, productsRes] = await Promise.allSettled([
        widgetApi.getConfig(storeId),
        productsApi.list(storeId, { status: 'active', limit: 100 }),
      ])

      if (configRes.status === 'fulfilled') {
        const c = configRes.value
        setConfig(c)
        setWidgetType(c.widget_type       || 'carousel')
        setTheme(c.theme                  || 'dark')
        setMaxItems(String(c.max_items    || 6))
        setPrimaryColor(c.primary_color   || '#8b5cf6')
        setWidgetTitle(c.title            || 'Recommended For You')
        setEnginePref(c.engine_preference || 'gemini')
        // widget_base_url is now included in the config response
        if (c.widget_base_url) setWidgetBaseUrl(c.widget_base_url)
      }

      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value.products || [])
      }
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { load() }, [storeId])

  // ── Derived values ─────────────────────────────────────────────────────────
  const settings   = { theme, widgetType, maxItems, primaryColor }

  // Preview iframe URL — uses Vite proxy (relative) so it works in Codespace
  const previewUrl = config?.widget_token ? (() => {
    const params = { theme, type: widgetType, max_items: maxItems, primary_color: primaryColor }
    if (embedType === 'product' && selectedProduct?.id) {
      params.product_id = selectedProduct.id
    }
    return widgetApi.widgetUrl(config.widget_token, params)
  })() : null

  // Embed codes — built client-side from current settings + absolute widget URL
  const liveCodes = useMemo(
    () => buildEmbedCodes(widgetBaseUrl, settings, embedType === 'product' ? selectedProduct?.id : null),
    [widgetBaseUrl, theme, widgetType, maxItems, primaryColor, embedType, selectedProduct?.id],
  )

  // URL displayed in the top card (uses the absolute URL if available, else proxy URL)
  const displayUrl = widgetBaseUrl ? (() => {
    const qs = new URLSearchParams({ theme, type: widgetType, max_items: maxItems, primary_color: primaryColor })
    if (embedType === 'product' && selectedProduct?.id) {
      qs.set('product_id', selectedProduct.id)
    }
    return `${widgetBaseUrl}?${qs.toString()}`
  })() : previewUrl

  // ── Save all settings ──────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await widgetApi.updateConfig({
        store_id:          storeId,
        widget_type:       widgetType,
        theme,
        max_items:         parseInt(maxItems),
        primary_color:     primaryColor,
        title:             widgetTitle,
        engine_preference: enginePref,
      })
      setConfig(updated)
      if (updated.widget_base_url) setWidgetBaseUrl(updated.widget_base_url)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (_) {}
    setSaving(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Embed Widget</h2>
          <p className="text-white/40 text-sm mt-1">
            Configure, preview, and embed your recommendation widget
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-white/40 hover:text-white"
            onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Badge variant="success" className="px-3 py-1 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            Widget Live
          </Badge>
        </div>
      </div>

      {/* Live widget URL */}
      <Card className="glass-card p-5 border border-violet-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <ExternalLink size={15} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Widget URL</h3>
            <p className="text-xs text-white/40">
              Updates as you adjust settings — copy after saving
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-violet-300 font-mono truncate">
            {loading ? 'Loading…' : (displayUrl || 'Generating…')}
          </code>
          {displayUrl && (
            <>
              <Button variant="outline" size="sm" className="shrink-0"
                onClick={() => navigator.clipboard.writeText(displayUrl)}>
                <Copy size={12} /> Copy
              </Button>
              <a href={previewUrl || displayUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="shrink-0 text-violet-400">
                  <ExternalLink size={12} />
                </Button>
              </a>
            </>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs>
        <TabsList>
          {[
            { id: 'builder', label: 'Widget Builder' },
            { id: 'code',    label: 'Embed Code'     },
            { id: 'shopify', label: 'Shopify Guide'  },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              active={activeTab === tab.id || activeTab.startsWith(`${tab.id}-`)}
              onClick={() => setActiveTab(tab.id === 'code' ? 'code-script' : tab.id)}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Builder ──────────────────────────────────────────────────────── */}
        {activeTab === 'builder' && (
          <TabsContent active={true}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Left column — settings */}
              <div className="lg:col-span-2 space-y-4">

                {/* Widget type */}
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <LayoutTemplate size={14} className="text-violet-400" /> Widget Type
                  </h3>
                  <div className="space-y-2">
                    {WIDGET_TYPES.map(({ id, label, icon: Icon, desc }) => (
                      <button key={id} onClick={() => setWidgetType(id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer',
                          widgetType === id
                            ? 'bg-violet-600/20 border border-violet-500/30'
                            : 'glass-card hover:border-white/20',
                        )}>
                        <Icon size={15} className={widgetType === id ? 'text-violet-400' : 'text-white/40'} />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-white">{label}</p>
                          <p className="text-[10px] text-white/40">{desc}</p>
                        </div>
                        {widgetType === id && <Check size={11} className="text-violet-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Theme */}
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Palette size={14} className="text-violet-400" /> Theme
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ id: 'dark', label: '🌙 Dark' }, { id: 'light', label: '☀️ Light' }].map(({ id, label }) => (
                      <button key={id} onClick={() => setTheme(id)}
                        className={cn(
                          'p-3 rounded-xl text-xs font-medium transition-all cursor-pointer',
                          theme === id
                            ? 'bg-violet-600 text-white'
                            : 'glass-card text-white/50 hover:text-white',
                        )}>
                        {label}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Appearance settings */}
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings2 size={14} className="text-violet-400" /> Appearance
                  </h3>
                  <div className="space-y-4">

                    {/* Primary colour */}
                    <div>
                      <Label className="text-xs mb-2 block">Primary Colour</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-9 rounded-lg cursor-pointer border border-white/20 bg-transparent p-1"
                          title="Pick primary colour"
                        />
                        <code className="flex-1 text-xs text-white/60 bg-white/5 px-2.5 py-1.5 rounded font-mono">
                          {primaryColor}
                        </code>
                        <button
                          className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                          onClick={() => setPrimaryColor('#8b5cf6')}>
                          Reset
                        </button>
                      </div>
                      {/* Colour swatch strip */}
                      <div className="flex gap-2 mt-2">
                        {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setPrimaryColor(c)}
                            style={{ background: c }}
                            className={cn(
                              'w-6 h-6 rounded-full transition-transform hover:scale-110',
                              primaryColor === c ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-black' : '',
                            )}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Widget title */}
                    <div>
                      <Label className="text-xs mb-2 block">Widget Title</Label>
                      <input
                        type="text"
                        value={widgetTitle}
                        onChange={(e) => setWidgetTitle(e.target.value)}
                        placeholder="Recommended For You"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 placeholder:text-white/20"
                      />
                    </div>

                    {/* Max products */}
                    <div>
                      <Label className="text-xs mb-2 block">Products to Show</Label>
                      <div className="flex flex-wrap gap-2">
                        {MAX_ITEMS_OPTS.map((n) => (
                          <button
                            key={n}
                            onClick={() => setMaxItems(n)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                              maxItems === n
                                ? 'bg-violet-600 text-white'
                                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white',
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Recommendation engine */}
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-violet-400" /> Recommendation Engine
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'gemini', label: 'Gemini AI', sub: 'LLM-powered',    Icon: Sparkles, accent: 'violet' },
                      { id: 'custom', label: 'Sklearn',   sub: 'TF-IDF cosine',  Icon: Brain,    accent: 'cyan'   },
                    ].map(({ id, label, sub, Icon, accent }) => {
                      const active = enginePref === id
                      return (
                        <button
                          key={id}
                          onClick={() => setEnginePref(id)}
                          className={cn(
                            'p-3 rounded-xl text-left border transition-all cursor-pointer',
                            active
                              ? accent === 'violet'
                                ? 'bg-violet-600/20 border-violet-500/30'
                                : 'bg-cyan-600/20 border-cyan-500/30'
                              : 'bg-white/5 border-white/10 hover:border-white/25',
                          )}
                        >
                          <Icon size={13} className={cn(
                            'mb-1.5',
                            active
                              ? accent === 'violet' ? 'text-violet-400' : 'text-cyan-400'
                              : 'text-white/30',
                          )} />
                          <p className="text-xs font-medium text-white">{label}</p>
                          <p className="text-[10px] text-white/40">{sub}</p>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-white/30 mt-2 leading-relaxed">
                    Selects which model powers the product recommendations shown in this widget.
                  </p>
                </Card>

                {/* Embed target */}
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <LayoutTemplate size={14} className="text-violet-400" /> Embed Target
                  </h3>
                  <div className="space-y-3">
                    {/* Embed type selection */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'home',    label: 'Home Page',       sub: 'Trending products', Icon: Home,     accent: 'emerald' },
                        { id: 'product', label: 'Product Page',    sub: 'Recommendations',   Icon: Package2, accent: 'orange'  },
                      ].map(({ id, label, sub, Icon, accent }) => {
                        const active = embedType === id
                        return (
                          <button
                            key={id}
                            onClick={() => setEmbedType(id)}
                            className={cn(
                              'p-3 rounded-xl text-left border transition-all cursor-pointer',
                              active
                                ? accent === 'emerald'
                                  ? 'bg-emerald-600/20 border-emerald-500/30'
                                  : 'bg-orange-600/20 border-orange-500/30'
                                : 'bg-white/5 border-white/10 hover:border-white/25',
                            )}
                          >
                            <Icon size={13} className={cn(
                              'mb-1.5',
                              active
                                ? accent === 'emerald' ? 'text-emerald-400' : 'text-orange-400'
                                : 'text-white/30',
                            )} />
                            <p className="text-xs font-medium text-white">{label}</p>
                            <p className="text-[10px] text-white/40">{sub}</p>
                          </button>
                        )
                      })}
                    </div>

                    {/* Product selector (shown only for product-specific embeds) */}
                    {embedType === 'product' && (
                      <div>
                        <Label className="text-xs mb-2 block">Select Product</Label>
                        {products.length > 0 ? (
                          <select
                            value={selectedProduct?.id || ''}
                            onChange={(e) => {
                              const productId = parseInt(e.target.value)
                              const product = products.find(p => p.id === productId)
                              setSelectedProduct(product || null)
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                          >
                            <option value="">Choose a product…</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id} className="bg-slate-800">
                                {product.name} {product.price ? `— $${product.price}` : ''}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-xs text-white/40 py-2 px-3 bg-white/5 rounded-lg border border-white/10">
                            No products found. Add products to your store first.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-white/30 mt-3 leading-relaxed">
                    {embedType === 'home'
                      ? 'Home page embeds show trending/popular products from your store.'
                      : 'Product page embeds show personalized recommendations based on the current product.'}
                  </p>
                </Card>

                {/* Save button */}
                <Button variant="glow" size="sm" className="w-full" onClick={handleSave} disabled={saving}>
                  {saving
                    ? <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving…
                      </span>
                    : saved
                    ? <><Check size={13} /> Saved!</>
                    : <><Save size={13} /> Save Configuration</>}
                </Button>
                {saved && (
                  <p className="text-[11px] text-emerald-400 text-center -mt-2">
                    ✓ Widget updated — embed codes now reflect your changes
                  </p>
                )}
              </div>

              {/* Right column — live iframe preview */}
              <div className="lg:col-span-3">
                <Card className="glass-card p-5 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Eye size={14} className="text-violet-400" /> Live Preview
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={theme === 'dark' ? 'default' : 'outline'} className="text-[10px]">
                        {theme}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {widgetType}
                      </Badge>
                      <span
                        className="w-4 h-4 rounded-full border-2 border-white/20 shrink-0"
                        style={{ background: primaryColor }}
                        title={primaryColor}
                      />
                    </div>
                  </div>

                  {/* Real iframe — proxied to backend */}
                  {previewUrl ? (
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <iframe
                        ref={iframeRef}
                        src={previewUrl}
                        style={{
                          width: '100%',
                          border: 'none',
                          minHeight: '300px',
                          display: 'block',
                          background: theme === 'dark' ? '#0f0f1a' : '#ffffff',
                        }}
                        scrolling="no"
                        frameBorder="0"
                        title="Widget Preview"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl h-64 bg-white/5 border border-white/10 flex items-center justify-center">
                      <p className="text-xs text-white/30">
                        {loading ? 'Loading preview…' : 'No widget configured yet'}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <p className="text-xs text-white/30">
                      {embedType === 'home'
                        ? `Trending products · ${enginePref === 'gemini' ? 'Gemini AI' : 'Sklearn'} engine`
                        : selectedProduct
                        ? `Recommendations for "${selectedProduct.name}" · ${enginePref === 'gemini' ? 'Gemini AI' : 'Sklearn'} engine`
                        : `Product recommendations · ${enginePref === 'gemini' ? 'Gemini AI' : 'Sklearn'} engine (select product)`
                      }
                    </p>
                    <Button variant="glow" size="sm" onClick={() => setActiveTab('code-script')}>
                      <Code2 size={12} /> Get Code
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}

        {/* ── Embed code tab ────────────────────────────────────────────────── */}
        {(activeTab === 'code' || activeTab.startsWith('code-')) && (
          <TabsContent active={true}>
            <div className="space-y-4">

              {/* Method selector + current settings summary */}
              <Card className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Choose Embed Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'script', label: 'Script Tag',   desc: 'Best for most HTML sites',              accent: 'amber' },
                    { id: 'iframe', label: 'iFrame Embed', desc: 'Sandboxed — Shopify / Wix / Webflow',   accent: 'cyan'  },
                    { id: 'liquid', label: 'Liquid Code',  desc: 'Shopify product page integration',      accent: 'pink'  },
                  ].map(({ id, label, desc }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(`code-${id}`)}
                      className={cn(
                        'p-4 rounded-xl text-left transition-all cursor-pointer border',
                        activeTab === `code-${id}`
                          ? 'bg-violet-600/20 border-violet-500/30'
                          : 'glass-card border-white/10 hover:border-white/20',
                      )}
                    >
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-white/50 mt-1">{desc}</p>
                    </button>
                  ))}
                </div>

                {/* Active settings chips */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/8">
                  {[
                    { k: 'Type',   v: widgetType },
                    { k: 'Theme',  v: theme      },
                    { k: 'Items',  v: maxItems   },
                    { k: 'Target', v: embedType === 'home' ? 'Home page' : selectedProduct ? selectedProduct.name : 'Product (select one)' },
                    { k: 'Engine', v: enginePref === 'gemini' ? 'Gemini AI' : 'Sklearn' },
                  ].map(({ k, v }) => (
                    <span key={k}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 capitalize">
                      {k}: <span className="text-white/80">{v}</span>
                    </span>
                  ))}
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border text-white/50"
                    style={{ background: primaryColor + '22', borderColor: primaryColor + '55' }}
                  >
                    Color: <span className="text-white/80">{primaryColor}</span>
                  </span>
                </div>
              </Card>

              {!liveCodes && (
                <p className="text-sm text-white/30 text-center py-8">
                  {loading ? 'Generating codes…' : 'Configure your widget to get embed codes'}
                </p>
              )}

              {liveCodes && activeTab === 'code-script' && (
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <Code2 size={14} className="text-violet-400" /> Script Tag
                  </h3>
                  <p className="text-xs text-white/50 mb-3">
                    Paste inside <code className="text-white/70">&lt;body&gt;</code>.
                    Auto-resizes to fit content via postMessage.
                  </p>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-amber-300">💡 Best for WordPress, custom HTML, landing pages</p>
                  </div>
                  <CodeBlock code={liveCodes.script_tag} />
                </Card>
              )}

              {liveCodes && activeTab === 'code-iframe' && (
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <Code2 size={14} className="text-cyan-400" /> iFrame Embed
                  </h3>
                  <p className="text-xs text-white/50 mb-3">
                    Sandboxed iframe — works anywhere iframes are permitted.
                  </p>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-cyan-300">💡 Best for Shopify buy buttons, Wix HTML widgets, Squarespace</p>
                  </div>
                  <CodeBlock code={liveCodes.iframe_tag} />
                </Card>
              )}

              {liveCodes && activeTab === 'code-liquid' && (
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <Code2 size={14} className="text-pink-400" /> Liquid Template
                  </h3>
                  <p className="text-xs text-white/50 mb-3">
                    Uses{' '}
                    <code className="text-white/70">{'{{ product.id }}'}</code>
                    {' '}to load personalised recommendations based on the current product page.
                  </p>
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-pink-300">💡 Best for Shopify product page Liquid templates</p>
                  </div>
                  <CodeBlock code={liveCodes.liquid_code} />
                </Card>
              )}
            </div>
          </TabsContent>
        )}

        {/* ── Shopify guide tab ─────────────────────────────────────────────── */}
        {activeTab === 'shopify' && (
          <TabsContent active={true}>
            <Card className="glass-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Zap size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Shopify Integration Guide</h3>
                  <p className="text-xs text-white/40">3 steps · no developer needed</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { step: 1, title: 'Open Theme Editor',
                    desc: 'In Shopify Admin → Online Store → Themes → click "Edit code".' },
                  { step: 2, title: 'Find the Product Template',
                    desc: 'Under "Templates", open product.json or product-template.liquid.' },
                  { step: 3, title: 'Paste the Liquid Code',
                    desc: 'Insert the snippet below the product description section, then save.' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-0.5">{s.title}</p>
                      <p className="text-xs text-white/50">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {liveCodes
                ? <CodeBlock code={liveCodes.liquid_code} />
                : <p className="text-sm text-white/30 text-center py-4">
                    Save widget configuration first to generate code
                  </p>
              }
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
