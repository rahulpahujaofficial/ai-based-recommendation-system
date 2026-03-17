import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Code2, Copy, Check, Eye, Palette, LayoutTemplate, ExternalLink,
  Zap, Grid2x2, List, Rows, RefreshCw, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn, formatPrice } from '@/lib/utils'
import { widgetApi, recsApi } from '@/lib/api'
import { useStore } from '@/context/StoreContext'
import { API_BASE } from '@/lib/api'

const widgetTypes = [
  { id: 'carousel', label: 'Carousel', icon: Rows, desc: 'Horizontal scrolling product carousel' },
  { id: 'grid', label: 'Grid', icon: Grid2x2, desc: '2×2 or 3×3 product grid layout' },
  { id: 'list', label: 'List', icon: List, desc: 'Vertical stacked product list' },
]

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
      <pre className="bg-black/60 border border-white/10 rounded-xl p-5 pt-4 text-xs text-white/80 overflow-x-auto scrollbar-thin leading-relaxed font-mono whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function WidgetPreview({ type, theme, products }) {
  const previewProducts = products.slice(0, 4)
  return (
    <div className={cn('rounded-xl p-4', theme === 'dark' ? 'bg-gray-950 border border-white/10' : 'bg-white border border-gray-200')}>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={13} className={theme === 'dark' ? 'text-violet-400' : 'text-violet-600'} />
        <span className={cn('text-xs font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
          Recommended For You
        </span>
        <span className={cn('text-[10px] ml-auto', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}>Powered by RecoAI</span>
      </div>
      {previewProducts.length === 0 ? (
        <p className={cn('text-xs text-center py-4', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}>No products yet</p>
      ) : type === 'list' ? (
        <div className="space-y-2">
          {previewProducts.slice(0, 3).map((rec) => {
            const p = rec.product || rec
            return (
              <div key={p.id} className={cn('flex items-center gap-3 p-2 rounded-lg', theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50')}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  : <div className="w-12 h-12 rounded-lg bg-gray-800 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium truncate', theme === 'dark' ? 'text-white' : 'text-gray-900')}>{p.name}</p>
                  <p className={cn('text-[10px]', theme === 'dark' ? 'text-white/40' : 'text-gray-500')}>{p.category}</p>
                </div>
                <p className={cn('text-xs font-bold shrink-0', theme === 'dark' ? 'text-white' : 'text-gray-900')}>{formatPrice(p.price)}</p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={cn('grid gap-3', type === 'grid' ? 'grid-cols-2' : 'grid-cols-4')}>
          {previewProducts.map((rec) => {
            const p = rec.product || rec
            return (
              <div key={p.id} className="group cursor-pointer">
                <div className={cn('aspect-square rounded-lg overflow-hidden mb-1.5', theme === 'dark' ? 'bg-white/5' : 'bg-gray-100')}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    : <div className="w-full h-full" />}
                </div>
                <p className={cn('text-[10px] leading-tight line-clamp-2 mb-0.5', theme === 'dark' ? 'text-white/70' : 'text-gray-700')}>{p.name}</p>
                <p className={cn('text-xs font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>{formatPrice(p.price)}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function EmbedPage() {
  const { storeId } = useStore()
  const [activeTab, setActiveTab] = useState('builder')
  const [config, setConfig] = useState(null)
  const [embedCodes, setEmbedCodes] = useState(null)
  const [previewProducts, setPreviewProducts] = useState([])
  const [widgetType, setWidgetType] = useState('carousel')
  const [theme, setTheme] = useState('dark')
  const [maxItems, setMaxItems] = useState('6')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [cfg, codes, trend] = await Promise.allSettled([
        widgetApi.getConfig(storeId),
        widgetApi.embedCodes(storeId),
        recsApi.trending(storeId, 4),
      ])
      if (cfg.status === 'fulfilled') {
        const c = cfg.value
        setConfig(c)
        setWidgetType(c.widget_type || 'carousel')
        setTheme(c.theme || 'dark')
        setMaxItems(String(c.max_items || 6))
      }
      if (codes.status === 'fulfilled') setEmbedCodes(codes.value)
      if (trend.status === 'fulfilled') setPreviewProducts(trend.value.recommendations || [])
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { load() }, [storeId])

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      const updated = await widgetApi.updateConfig({
        store_id: storeId,
        widget_type: widgetType,
        theme,
        max_items: parseInt(maxItems),
      })
      setConfig(updated)
      const codes = await widgetApi.embedCodes(storeId)
      setEmbedCodes(codes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (_) {}
    setSaving(false)
  }

  const widgetUrl = config ? widgetApi.widgetUrl(config.widget_token, { theme, type: widgetType }) : ''

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Embed Widget</h2>
          <p className="text-white/40 text-sm mt-1">Generate and customize your recommendation widget</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-white/40 hover:text-white" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Badge variant="success" className="px-3 py-1 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            Widget Live
          </Badge>
        </div>
      </div>

      {/* Embed URL */}
      <Card className="glass-card p-5 border border-violet-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <ExternalLink size={15} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Your Unique Widget URL</h3>
            <p className="text-xs text-white/40">Embed this URL as an iframe on any website</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-violet-300 font-mono truncate">
            {loading ? 'Loading…' : widgetUrl || 'Generating…'}
          </code>
          {widgetUrl && (
            <>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => navigator.clipboard.writeText(widgetUrl)}>
                <Copy size={12} /> Copy
              </Button>
              <a href={widgetUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="shrink-0 text-violet-400"><ExternalLink size={12} /></Button>
              </a>
            </>
          )}
        </div>
      </Card>

      <Tabs>
        <TabsList>
          {[{ id: 'builder', label: 'Widget Builder' }, { id: 'code', label: 'Embed Code' }, { id: 'shopify', label: 'Shopify Guide' }].map((tab) => (
            <TabsTrigger key={tab.id} active={activeTab === tab.id || activeTab.startsWith(`${tab.id}-`)}
              onClick={() => setActiveTab(tab.id === 'code' ? 'code-script' : tab.id)}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeTab === 'builder' && (
          <TabsContent active={true}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <LayoutTemplate size={14} className="text-violet-400" /> Widget Type
                  </h3>
                  <div className="space-y-2">
                    {widgetTypes.map((wt) => {
                      const Icon = wt.icon
                      return (
                        <button key={wt.id} onClick={() => setWidgetType(wt.id)}
                          className={cn('w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer',
                            widgetType === wt.id ? 'bg-violet-600/20 border border-violet-500/30' : 'glass-card hover:border-white/20')}>
                          <Icon size={16} className={widgetType === wt.id ? 'text-violet-400' : 'text-white/40'} />
                          <div>
                            <p className="text-xs font-medium text-white">{wt.label}</p>
                            <p className="text-[10px] text-white/40">{wt.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </Card>

                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette size={14} className="text-violet-400" /> Theme
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['dark', 'light'].map((t) => (
                      <button key={t} onClick={() => setTheme(t)}
                        className={cn('p-3 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer',
                          theme === t ? 'bg-violet-600 text-white' : 'glass-card text-white/50 hover:text-white')}>
                        {t}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs mb-1.5 block">Max Products to Show</Label>
                      <select value={maxItems} onChange={(e) => setMaxItems(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                        {['2', '3', '4', '6', '8'].map(n => <option key={n} value={n} className="bg-gray-900">{n} products</option>)}
                      </select>
                    </div>
                  </div>
                  <Button variant="glow" size="sm" className="w-full mt-4" onClick={handleSaveConfig} disabled={saving}>
                    {saving ? <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
                      : saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save Config</>}
                  </Button>
                </Card>
              </div>

              <div className="lg:col-span-3">
                <Card className="glass-card p-5 sticky top-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Eye size={14} className="text-violet-400" /> Live Preview
                    </h3>
                    <Badge variant={theme === 'dark' ? 'default' : 'outline'} className="text-[10px]">{theme} theme</Badge>
                  </div>
                  <WidgetPreview type={widgetType} theme={theme} products={previewProducts} />
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <p className="text-xs text-white/30">
                      {previewProducts.length > 0 ? `${previewProducts.length} real products shown` : 'Add products to see preview'}
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

        {(activeTab === 'code' || activeTab.startsWith('code-')) && (
          <TabsContent active={true}>
            <div className="space-y-4">
              <Card className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Select Embed Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'script', label: 'Script Tag', desc: 'Recommended for most users' },
                    { id: 'iframe', label: 'iFrame Embed', desc: 'Isolated & sandbox safe' },
                    { id: 'liquid', label: 'Liquid Code', desc: 'For Shopify theme developers' },
                  ].map((method) => (
                    <button key={method.id} onClick={() => setActiveTab(`code-${method.id}`)}
                      className={cn('p-4 rounded-xl text-left transition-all cursor-pointer border',
                        activeTab === `code-${method.id}` ? 'bg-violet-600/20 border-violet-500/30' : 'glass-card border-white/10 hover:border-white/20')}>
                      <p className="text-sm font-medium text-white">{method.label}</p>
                      <p className="text-xs text-white/50 mt-1">{method.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {(activeTab === 'code-script' || activeTab === 'code') && embedCodes && (
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Code2 size={14} className="text-violet-400" /> Script Tag Embed</h3>
                  <p className="text-xs text-white/50 mb-4">Paste this snippet in your HTML.</p>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-amber-300 font-medium">💡 Best for: WordPress, custom HTML</p>
                  </div>
                  <CodeBlock code={embedCodes.script_tag} />
                </Card>
              )}

              {activeTab === 'code-iframe' && embedCodes && (
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Code2 size={14} className="text-cyan-400" /> iFrame Embed</h3>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-cyan-300 font-medium">💡 Best for: Shopify, Wix, Squarespace</p>
                  </div>
                  <CodeBlock code={embedCodes.iframe_tag} />
                </Card>
              )}

              {activeTab === 'code-liquid' && embedCodes && (
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Code2 size={14} className="text-pink-400" /> Liquid Template Code</h3>
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-pink-300 font-medium">💡 Best for: Shopify Liquid templates</p>
                  </div>
                  <CodeBlock code={embedCodes.liquid_code} />
                </Card>
              )}

              {!embedCodes && <p className="text-sm text-white/30 text-center py-8">Loading embed codes…</p>}
            </div>
          </TabsContent>
        )}

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
                  { step: 1, title: 'Open Theme Editor', desc: 'Shopify Admin → Online Store → Themes → Edit code.' },
                  { step: 2, title: 'Find Product Template', desc: 'Under "Templates", open product.json or product-template.liquid.' },
                  { step: 3, title: 'Paste the Liquid Code', desc: 'Place it below the product description. Save the file.' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">{s.step}</div>
                    <div>
                      <p className="text-sm font-medium text-white mb-0.5">{s.title}</p>
                      <p className="text-xs text-white/50">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {embedCodes && <CodeBlock code={embedCodes.liquid_code} />}
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
