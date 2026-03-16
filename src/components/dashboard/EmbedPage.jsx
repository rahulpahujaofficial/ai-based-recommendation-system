import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Copy, Check, Eye, Palette, LayoutTemplate, ExternalLink, Zap, Grid2x2, List, Rows, ChevronDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MOCK_PRODUCTS } from '@/data/mockData'
import { generateEmbedCode, generateIframeCode, generateLiquidCode, formatPrice, cn } from '@/lib/utils'

const STORE_ID = 'store_abc123xyz'

const widgetTypes = [
  { id: 'carousel', label: 'Carousel', icon: Rows, desc: 'Horizontal scrolling product carousel' },
  { id: 'grid', label: 'Grid', icon: Grid2x2, desc: '2x2 or 3x3 product grid layout' },
  { id: 'list', label: 'List', icon: List, desc: 'Vertical stacked product list' },
]

const placements = [
  { id: 'product_page', label: 'Product Page', desc: 'Below product description' },
  { id: 'cart_page', label: 'Cart Page', desc: 'Before checkout button' },
  { id: 'homepage', label: 'Homepage', desc: 'Featured recommendations' },
  { id: 'checkout', label: 'Checkout', desc: 'Post-purchase upsell' },
]

function WidgetPreview({ type, theme, products }) {
  const previewProducts = products.slice(0, 4)

  return (
    <div className={cn('rounded-xl p-4', theme === 'dark' ? 'bg-gray-950 border border-white/10' : 'bg-white border border-gray-200')}>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={13} className={theme === 'dark' ? 'text-violet-400' : 'text-violet-600'} />
        <span className={cn('text-xs font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
          Recommended For You
        </span>
        <span className={cn('text-[10px] ml-auto', theme === 'dark' ? 'text-white/30' : 'text-gray-400')}>
          Powered by RecoAI
        </span>
      </div>

      {type === 'carousel' || type === 'grid' ? (
        <div className={cn('grid gap-3', type === 'grid' ? 'grid-cols-2' : 'grid-cols-4')}>
          {previewProducts.map((p) => (
            <div key={p.id} className="group cursor-pointer">
              <div className={cn('aspect-square rounded-lg overflow-hidden mb-1.5', theme === 'dark' ? 'bg-white/5' : 'bg-gray-100')}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <p className={cn('text-[10px] leading-tight line-clamp-2 mb-0.5', theme === 'dark' ? 'text-white/70' : 'text-gray-700')}>{p.name}</p>
              <p className={cn('text-xs font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>{formatPrice(p.price)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {previewProducts.slice(0, 3).map((p) => (
            <div key={p.id} className={cn('flex items-center gap-3 p-2 rounded-lg', theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50')}>
              <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-medium truncate', theme === 'dark' ? 'text-white' : 'text-gray-900')}>{p.name}</p>
                <p className={cn('text-[10px]', theme === 'dark' ? 'text-white/40' : 'text-gray-500')}>{p.category}</p>
              </div>
              <p className={cn('text-xs font-bold shrink-0', theme === 'dark' ? 'text-white' : 'text-gray-900')}>{formatPrice(p.price)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
        <Button
          variant="glass"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={copy}
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="bg-black/60 border border-white/10 rounded-xl p-5 pt-4 text-xs text-white/80 overflow-x-auto scrollbar-thin leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function EmbedPage() {
  const [activeTab, setActiveTab] = useState('builder')
  const [widgetType, setWidgetType] = useState('carousel')
  const [theme, setTheme] = useState('dark')
  const [placement, setPlacement] = useState('product_page')
  const [maxProducts, setMaxProducts] = useState('4')

  const embedCode = generateEmbedCode(STORE_ID, widgetType, theme)

  const shopifyInstructions = `<!-- Step 1: Open your Shopify admin -->
<!-- Step 2: Go to Online Store > Themes > Edit Code -->
<!-- Step 3: Find product-template.liquid or product.liquid -->
<!-- Step 4: Paste the code below where you want the widget -->

${embedCode}

<!-- That's it! The widget will appear on all product pages automatically -->
<!-- RecoAI reads the product ID from the URL automatically -->`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Embed Widget</h2>
          <p className="text-white/40 text-sm mt-1">Generate and customize your recommendation widget</p>
        </div>
        <Badge variant="success" className="px-3 py-1 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
          Widget Live
        </Badge>
      </div>

      {/* Embed URL */}
      <Card className="glass-card p-5 border border-violet-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <ExternalLink size={15} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Your Unique Embed URL</h3>
            <p className="text-xs text-white/40">Share this URL with your development team or use it directly</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-violet-300 font-mono truncate">
            https://cdn.recoai.io/widget/{STORE_ID}?type={widgetType}&theme={theme}
          </code>
          <Button variant="outline" size="sm" className="shrink-0">
            <Copy size={12} /> Copy URL
          </Button>
        </div>
      </Card>

      <Tabs>
        <TabsList>
          {[
            { id: 'builder', label: 'Widget Builder' },
            { id: 'code', label: 'Embed Code' },
            { id: 'shopify', label: 'Shopify Guide' },
          ].map((tab) => (
            <TabsTrigger key={tab.id} active={activeTab === tab.id || activeTab.startsWith(`${tab.id}-`)} onClick={() => setActiveTab(tab.id === 'code' ? 'code-script' : tab.id)}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeTab === 'builder' && (
          <TabsContent active={true}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Config panel */}
              <div className="lg:col-span-2 space-y-5">
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <LayoutTemplate size={14} className="text-violet-400" />
                    Widget Type
                  </h3>
                  <div className="space-y-2">
                    {widgetTypes.map((wt) => {
                      const Icon = wt.icon
                      return (
                        <button
                          key={wt.id}
                          onClick={() => setWidgetType(wt.id)}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer',
                            widgetType === wt.id
                              ? 'bg-violet-600/20 border border-violet-500/30'
                              : 'glass-card hover:border-white/20'
                          )}
                        >
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
                    <Palette size={14} className="text-violet-400" />
                    Theme
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['dark', 'light'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          'p-3 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer',
                          theme === t
                            ? 'bg-violet-600 text-white'
                            : 'glass-card text-white/50 hover:text-white'
                        )}
                      >
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
                      <select
                        value={maxProducts}
                        onChange={(e) => setMaxProducts(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                      >
                        {['2', '3', '4', '6', '8'].map(n => <option key={n} value={n} className="bg-gray-900">{n} products</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Placement</Label>
                      <select
                        value={placement}
                        onChange={(e) => setPlacement(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                      >
                        {placements.map(p => <option key={p.id} value={p.id} className="bg-gray-900">{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Preview */}
              <div className="lg:col-span-3">
                <Card className="glass-card p-5 sticky top-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Eye size={14} className="text-violet-400" />
                      Live Preview
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={theme === 'dark' ? 'default' : 'outline'} className="text-[10px]">
                        {theme} theme
                      </Badge>
                    </div>
                  </div>
                  <WidgetPreview type={widgetType} theme={theme} products={MOCK_PRODUCTS} />
                  <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                    <p className="text-xs text-white/30">Widget auto-updates as you configure</p>
                    <Button variant="glow" size="sm" onClick={() => setActiveTab('code')}>
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
                    <button
                      key={method.id}
                      onClick={() => setActiveTab(`code-${method.id}`)}
                      className={cn(
                        'p-4 rounded-xl text-left transition-all cursor-pointer border',
                        activeTab === `code-${method.id}`
                          ? 'bg-violet-600/20 border-violet-500/30'
                          : 'glass-card border-white/10 hover:border-white/20'
                      )}
                    >
                      <p className="text-sm font-medium text-white">{method.label}</p>
                      <p className="text-xs text-white/50 mt-1">{method.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {activeTab === 'code-script' || activeTab === 'code' ? (
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Code2 size={14} className="text-violet-400" />
                    Script Tag Embed
                  </h3>
                  <p className="text-xs text-white/50 mb-4">Paste this code in your HTML. Works on any website with JavaScript enabled.</p>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-amber-300 font-medium">💡 Best for: WordPress, custom HTML, most platforms</p>
                  </div>
                  <CodeBlock code={embedCode} />
                </Card>
              ) : null}

              {activeTab === 'code-iframe' ? (
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Code2 size={14} className="text-cyan-400" />
                    iFrame Embed
                  </h3>
                  <p className="text-xs text-white/50 mb-4">Self-contained embed that doesn't affect your site's styling. Recommended for maximum compatibility.</p>
                  <div className="space-y-3 mb-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Height (pixels)</Label>
                      <Input type="number" defaultValue="400" placeholder="Height in pixels" className="text-sm" />
                    </div>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-cyan-300 font-medium">💡 Best for: Shopify theme customization, Wix, Squarespace</p>
                  </div>
                  <CodeBlock code={generateIframeCode(STORE_ID, widgetType, theme, '400')} />
                </Card>
              ) : null}

              {activeTab === 'code-liquid' ? (
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Code2 size={14} className="text-pink-400" />
                    Liquid Template Code
                  </h3>
                  <p className="text-xs text-white/50 mb-4">For Shopify theme developers. Automatically pulls product ID from current product page.</p>
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-pink-300 font-medium">💡 Best for: Shopify Liquid theme templates, custom developer work</p>
                  </div>
                  <CodeBlock code={generateLiquidCode(STORE_ID, widgetType, theme)} />
                  <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-white/60 mb-2"><strong>Usage:</strong> This code automatically checks if a product exists and only shows the widget on product pages.</p>
                  </div>
                </Card>
              ) : null}
            </div>
          </TabsContent>
        )}

        {activeTab === 'shopify' && (
          <TabsContent active={true}>
            <div className="space-y-4">
              <Card className="glass-card p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Zap size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Shopify Integration Guide</h3>
                    <p className="text-xs text-white/40">3 steps, no developer needed</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {[
                    { step: 1, title: 'Open Theme Editor', desc: 'In your Shopify Admin, go to Online Store → Themes → click "Edit code" on your active theme.' },
                    { step: 2, title: 'Find Product Template', desc: 'In the left sidebar, under "Templates", open "product.json" or "product-template.liquid" depending on your theme.' },
                    { step: 3, title: 'Paste the Embed Code', desc: 'Find where you want the recommendations to appear (below the product description is recommended) and paste the code.' },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                        {s.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white mb-0.5">{s.title}</p>
                        <p className="text-xs text-white/50 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <CodeBlock code={shopifyInstructions} />
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
