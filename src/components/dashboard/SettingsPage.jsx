import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, CreditCard, Shield, Save, Check, Store, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { storesApi, widgetApi } from '@/lib/api'
import { useStore } from '@/context/StoreContext'

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-white/40 mt-0.5">{desc}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600" />
      </label>
    </div>
  )
}

function SaveButton({ saving, saved, onClick }) {
  return (
    <Button variant="glow" size="sm" onClick={onClick} disabled={saving}>
      {saving
        ? <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
        : saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
    </Button>
  )
}

export default function SettingsPage() {
  const { storeId, store, refreshStore } = useStore()
  const [activeTab, setActiveTab] = useState('store')

  // Store settings
  const [storeName, setStoreName] = useState('')
  const [storeDomain, setStoreDomain] = useState('')

  // Widget config
  const [widgetConfig, setWidgetConfig] = useState(null)
  const [maxItems, setMaxItems] = useState('6')
  const [widgetTheme, setWidgetTheme] = useState('dark')
  const [widgetType, setWidgetType] = useState('carousel')
  const [widgetTitle, setWidgetTitle] = useState('Recommended for You')
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6')

  // AI toggles (stored in widgetConfig as future fields; kept as local state for now)
  const [excludeOOS, setExcludeOOS] = useState(true)
  const [autoRetrain, setAutoRetrain] = useState(true)
  const [crossSellOnly, setCrossSellOnly] = useState(false)

  const [storeSaving, setStoreSaving] = useState(false)
  const [storeSaved, setStoreSaved] = useState(false)
  const [widgetSaving, setWidgetSaving] = useState(false)
  const [widgetSaved, setWidgetSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (store) { setStoreName(store.name || ''); setStoreDomain(store.domain || '') }
  }, [store])

  useEffect(() => {
    widgetApi.getConfig(storeId).then((cfg) => {
      setWidgetConfig(cfg)
      setMaxItems(String(cfg.max_items || 6))
      setWidgetTheme(cfg.theme || 'dark')
      setWidgetType(cfg.widget_type || 'carousel')
      setWidgetTitle(cfg.title || 'Recommended for You')
      setPrimaryColor(cfg.primary_color || '#8b5cf6')
    }).catch(() => {})
  }, [storeId])

  const saveStore = async () => {
    setStoreSaving(true); setError('')
    try {
      await storesApi.update(storeId, { name: storeName, domain: storeDomain })
      refreshStore()
      setStoreSaved(true); setTimeout(() => setStoreSaved(false), 2500)
    } catch (err) { setError(err.message) }
    setStoreSaving(false)
  }

  const saveWidget = async () => {
    setWidgetSaving(true); setError('')
    try {
      const cfg = await widgetApi.updateConfig({
        store_id: storeId,
        widget_type: widgetType,
        theme: widgetTheme,
        max_items: parseInt(maxItems),
        title: widgetTitle,
        primary_color: primaryColor,
      })
      setWidgetConfig(cfg)
      setWidgetSaved(true); setTimeout(() => setWidgetSaved(false), 2500)
    } catch (err) { setError(err.message) }
    setWidgetSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-white/40 text-sm mt-1">Manage your store and widget preferences</p>
        </div>
      </div>

      {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>}

      <Tabs>
        <TabsList className="flex-wrap gap-1">
          {[
            { id: 'store', label: 'Store', icon: Store },
            { id: 'widget', label: 'Widget', icon: () => <span className="text-[10px]">{}⚙</span> },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-1.5">
                <Icon size={12} />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {activeTab === 'store' && (
          <TabsContent active={true}>
            <div className="space-y-4">
              <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-white">Store Information</h3>
                  <SaveButton saving={storeSaving} saved={storeSaved} onClick={saveStore} />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs mb-1.5 block">Store Name</Label>
                    <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="My Shopify Store" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Store Domain</Label>
                    <div className="flex items-center gap-2">
                      <Input value={storeDomain} onChange={(e) => setStoreDomain(e.target.value)}
                        placeholder="mystore.myshopify.com" className="font-mono text-xs" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Store ID</Label>
                    <Input value={storeId} readOnly className="font-mono text-xs text-white/40 cursor-default" />
                    <p className="text-xs text-white/30 mt-1">Used in embed code and API calls. Cannot be changed.</p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-sm font-medium text-white mb-3">AI Behavior</h3>
                <div className="space-y-0">
                  <Toggle checked={autoRetrain} onChange={setAutoRetrain} label="Auto-retrain model" desc="Retrain AI every 24 hours automatically" />
                  <Toggle checked={excludeOOS} onChange={setExcludeOOS} label="Exclude out-of-stock" desc="Never show products with zero inventory" />
                  <Toggle checked={crossSellOnly} onChange={setCrossSellOnly} label="Cross-sell only" desc="Only recommend products from different categories" />
                </div>
              </Card>
            </div>
          </TabsContent>
        )}

        {activeTab === 'widget' && (
          <TabsContent active={true}>
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">Widget Configuration</h3>
                <SaveButton saving={widgetSaving} saved={widgetSaved} onClick={saveWidget} />
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Widget Title</Label>
                  <Input value={widgetTitle} onChange={(e) => setWidgetTitle(e.target.value)} placeholder="Recommended for You" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs mb-1.5 block">Widget Type</Label>
                    <select value={widgetType} onChange={(e) => setWidgetType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                      {['carousel', 'grid', 'list'].map(t => <option key={t} value={t} className="bg-gray-900 capitalize">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Theme</Label>
                    <select value={widgetTheme} onChange={(e) => setWidgetTheme(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                      {['dark', 'light'].map(t => <option key={t} value={t} className="bg-gray-900 capitalize">{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs mb-1.5 block">Max Products</Label>
                    <select value={maxItems} onChange={(e) => setMaxItems(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                      {['2', '3', '4', '6', '8'].map(n => <option key={n} value={n} className="bg-gray-900">{n} products</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                      <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="font-mono text-xs flex-1" />
                    </div>
                  </div>
                </div>
                {widgetConfig && (
                  <div className="pt-3 border-t border-white/8">
                    <Label className="text-xs mb-1.5 block text-white/40">Widget Token</Label>
                    <code className="text-xs text-violet-300 font-mono break-all">{widgetConfig.widget_token}</code>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        )}

        {activeTab === 'notifications' && (
          <TabsContent active={true}>
            <Card className="glass-card p-6">
              <h3 className="text-base font-semibold text-white mb-5">Notification Preferences</h3>
              <div className="space-y-0">
                <Toggle checked={true} onChange={() => {}} label="Weekly performance report" desc="Summary of recommendations every Monday" />
                <Toggle checked={true} onChange={() => {}} label="AI model retrained" desc="Alert when AI updates its model" />
                <Toggle checked={false} onChange={() => {}} label="Low credit warning" desc="Notify when AI credits drop below 1,000" />
                <Toggle checked={true} onChange={() => {}} label="Integration errors" desc="Immediate alerts when sync fails" />
                <Toggle checked={false} onChange={() => {}} label="New product import" desc="Confirm when catalog is imported" />
              </div>
            </Card>
          </TabsContent>
        )}

        {activeTab === 'billing' && (
          <TabsContent active={true}>
            <div className="space-y-4">
              <Card className="glass-card p-6 border border-violet-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Growth Plan</h3>
                    <p className="text-xs text-white/40 mt-0.5">Next billing: April 16, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">$79</p>
                    <p className="text-xs text-white/40">per month</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="glow" size="sm" className="flex-1">Upgrade to Enterprise</Button>
                  <Button variant="outline" size="sm">Manage Plan</Button>
                </div>
              </Card>
              <Card className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-4">Payment Method</h3>
                <div className="flex items-center gap-3 p-3 rounded-xl glass-card border border-white/10 mb-4">
                  <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">VISA</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">•••• •••• •••• 4242</p>
                    <p className="text-xs text-white/40">Expires 12/27</p>
                  </div>
                  <Badge variant="success" className="ml-auto text-[10px]">Default</Badge>
                </div>
                <Button variant="outline" size="sm" className="text-xs">+ Add Payment Method</Button>
              </Card>
            </div>
          </TabsContent>
        )}

        {activeTab === 'security' && (
          <TabsContent active={true}>
            <div className="space-y-4">
              <Card className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-5">Change Password</h3>
                <div className="space-y-3 max-w-sm">
                  <div><Label className="text-xs mb-1.5 block">Current Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <div><Label className="text-xs mb-1.5 block">New Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <div><Label className="text-xs mb-1.5 block">Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <Button variant="glow" size="sm" className="mt-2">Update Password</Button>
                </div>
              </Card>
              <Card className="glass-card p-6 border border-red-500/20">
                <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                  <div>
                    <p className="text-sm font-medium text-white">Delete Store Data</p>
                    <p className="text-xs text-white/40">Removes all products and recommendations. Irreversible.</p>
                  </div>
                  <Button variant="destructive" size="sm" className="text-xs bg-red-900/50 text-red-400 border border-red-500/30 hover:bg-red-900/70">
                    <Trash2 size={12} /> Delete
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
