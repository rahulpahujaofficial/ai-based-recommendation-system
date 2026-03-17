import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, CreditCard, Shield, Save, Check, Store, Trash2, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { storesApi, widgetApi, analyticsApi } from '@/lib/api'
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
  const [storeSaving, setStoreSaving] = useState(false)
  const [storeSaved, setStoreSaved] = useState(false)

  // Widget config
  const [widgetConfig, setWidgetConfig] = useState(null)
  const [maxItems, setMaxItems] = useState('6')
  const [widgetTheme, setWidgetTheme] = useState('dark')
  const [widgetType, setWidgetType] = useState('carousel')
  const [widgetTitle, setWidgetTitle] = useState('Recommended for You')
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6')
  const [widgetSaving, setWidgetSaving] = useState(false)
  const [widgetSaved, setWidgetSaved] = useState(false)

  // AI behavior settings
  const [excludeOOS, setExcludeOOS] = useState(true)
  const [autoRetrain, setAutoRetrain] = useState(true)
  const [crossSellOnly, setCrossSellOnly] = useState(false)
  const [aiSaving, setAiSaving] = useState(false)
  const [aiSaved, setAiSaved] = useState(false)

  // Notification settings
  const [notifyWeekly, setNotifyWeekly] = useState(true)
  const [notifyRetrained, setNotifyRetrained] = useState(true)
  const [notifyLowCredit, setNotifyLowCredit] = useState(false)
  const [notifyErrors, setNotifyErrors] = useState(true)
  const [notifyImport, setNotifyImport] = useState(false)
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)

  // Billing
  const [analytics, setAnalytics] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentCard, setPaymentCard] = useState('•••• •••• •••• 4242')
  const [paymentExpiry, setPaymentExpiry] = useState('12/27')

  // Security
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    if (store) {
      setStoreName(store.name || '')
      setStoreDomain(store.domain || '')
    }
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

  useEffect(() => {
    // Load AI + Notification settings
    storesApi.getSettings(storeId).then((settings) => {
      setExcludeOOS(settings.exclude_out_of_stock)
      setAutoRetrain(settings.auto_retrain)
      setCrossSellOnly(settings.cross_sell_only)
      setNotifyWeekly(settings.notify_weekly_report)
      setNotifyRetrained(settings.notify_model_retrained)
      setNotifyLowCredit(settings.notify_low_credit)
      setNotifyErrors(settings.notify_integration_errors)
      setNotifyImport(settings.notify_new_import)
    }).catch(() => {})

    // Load analytics data
    analyticsApi.summary(storeId).then((data) => {
      setAnalytics(data)
    }).catch(() => {})

    setLoading(false)
  }, [storeId])

  const saveStore = async () => {
    setStoreSaving(true)
    setError('')
    try {
      await storesApi.update(storeId, { name: storeName, domain: storeDomain })
      refreshStore()
      setStoreSaved(true)
      setTimeout(() => setStoreSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    }
    setStoreSaving(false)
  }

  const saveWidget = async () => {
    setWidgetSaving(true)
    setError('')
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
      setWidgetSaved(true)
      setTimeout(() => setWidgetSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    }
    setWidgetSaving(false)
  }

  const saveAiSettings = async () => {
    setAiSaving(true)
    setError('')
    try {
      await storesApi.updateSettings(storeId, {
        exclude_out_of_stock: excludeOOS,
        auto_retrain: autoRetrain,
        cross_sell_only: crossSellOnly,
      })
      setAiSaved(true)
      setTimeout(() => setAiSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    }
    setAiSaving(false)
  }

  const saveNotifications = async () => {
    setNotifSaving(true)
    setError('')
    try {
      await storesApi.updateSettings(storeId, {
        notify_weekly_report: notifyWeekly,
        notify_model_retrained: notifyRetrained,
        notify_low_credit: notifyLowCredit,
        notify_integration_errors: notifyErrors,
        notify_new_import: notifyImport,
      })
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    }
    setNotifSaving(false)
  }

  const validatePassword = () => {
    const errors = {}
    if (!currentPassword) errors.current = 'Current password required'
    if (!newPassword) errors.new = 'New password required'
    if (!confirmPassword) errors.confirm = 'Confirm password required'
    if (newPassword && newPassword.length < 8) errors.new = 'Password must be at least 8 characters'
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirm = 'Passwords do not match'
    }
    return errors
  }

  const savePassword = async () => {
    const errors = validatePassword()
    setPasswordErrors(errors)
    if (Object.keys(errors).length > 0) return

    setPasswordSaving(true)
    try {
      // Simulate password update (no actual backend auth system)
      await new Promise(resolve => setTimeout(resolve, 800))
      setPasswordSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    }
    setPasswordSaving(false)
  }

  const confirmDeleteData = async () => {
    if (deleteConfirmText !== storeId) {
      setDeleteError('Store ID does not match')
      return
    }

    setDeleteError('')
    try {
      await storesApi.deleteData(storeId)
      setDeleteConfirmOpen(false)
      setDeleteConfirmText('')
      setError('')
      // Refresh store context to update product counts
      refreshStore()
      // Show success feedback
      setDeleteConfirmOpen(false)
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete data')
    }
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
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-medium text-white">AI Behavior</h3>
                  <SaveButton saving={aiSaving} saved={aiSaved} onClick={saveAiSettings} />
                </div>
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
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">Notification Preferences</h3>
                <SaveButton saving={notifSaving} saved={notifSaved} onClick={saveNotifications} />
              </div>
              <div className="space-y-0">
                <Toggle checked={notifyWeekly} onChange={setNotifyWeekly} label="Weekly performance report" desc="Summary of recommendations every Monday" />
                <Toggle checked={notifyRetrained} onChange={setNotifyRetrained} label="AI model retrained" desc="Alert when AI updates its model" />
                <Toggle checked={notifyLowCredit} onChange={setNotifyLowCredit} label="Low credit warning" desc="Notify when AI credits drop below 1,000" />
                <Toggle checked={notifyErrors} onChange={setNotifyErrors} label="Integration errors" desc="Immediate alerts when sync fails" />
                <Toggle checked={notifyImport} onChange={setNotifyImport} label="New product import" desc="Confirm when catalog is imported" />
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
                <div className="space-y-3 mb-4 p-3 bg-white/5 rounded-lg border border-white/8">
                  <div className="text-xs text-white/60">
                    <p className="font-medium text-white mb-2">Current Usage:</p>
                    <div className="space-y-1">
                      <p>📦 Products: {analytics?.total_products || 0}</p>
                      <p>🎯 Recommendations: {analytics?.total_recommendations || 0}</p>
                      <p>👥 Monthly Active Users: {analytics?.active_users || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="glow" size="sm" className="flex-1" onClick={() => setShowUpgradeModal(true)}>Upgrade to Enterprise</Button>
                  <Button variant="outline" size="sm">Manage Plan</Button>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-4">Payment Method</h3>
                <div className="flex items-center gap-3 p-3 rounded-xl glass-card border border-white/10 mb-4">
                  <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">VISA</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{paymentCard}</p>
                    <p className="text-xs text-white/40">Expires {paymentExpiry}</p>
                  </div>
                  <Badge variant="success" className="text-[10px]">Default</Badge>
                </div>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowPaymentForm(!showPaymentForm)}>
                  {showPaymentForm ? '✕ Cancel' : '+ Add Payment Method'}
                </Button>

                {showPaymentForm && (
                  <motion.div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                    <Input placeholder="Card number" className="text-xs" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="MM/YY" className="text-xs" />
                      <Input placeholder="CVC" className="text-xs" maxLength="3" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="glow" size="sm" className="flex-1 text-xs" onClick={() => {
                        setShowPaymentForm(false)
                      }}>Save Method</Button>
                      <Button variant="outline" size="sm" onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                    </div>
                  </motion.div>
                )}
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
                  <div>
                    <Label className="text-xs mb-1.5 block">Current Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    {passwordErrors.current && <p className="text-xs text-red-400 mt-1">{passwordErrors.current}</p>}
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">New Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {passwordErrors.new && <p className="text-xs text-red-400 mt-1">{passwordErrors.new}</p>}
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {passwordErrors.confirm && <p className="text-xs text-red-400 mt-1">{passwordErrors.confirm}</p>}
                  </div>
                  <Button
                    variant="glow"
                    size="sm"
                    className="mt-2"
                    onClick={savePassword}
                    disabled={passwordSaving}
                  >
                    {passwordSaving ? 'Updating...' : passwordSaved ? 'Password Updated!' : 'Update Password'}
                  </Button>
                  <p className="text-xs text-white/40">Password changes take effect on next login</p>
                </div>
              </Card>

              <Card className="glass-card p-6 border border-red-500/20">
                <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                  <div>
                    <p className="text-sm font-medium text-white">Delete Store Data</p>
                    <p className="text-xs text-white/40">Removes all products and recommendations. Irreversible.</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs bg-red-900/50 text-red-400 border border-red-500/30 hover:bg-red-900/70"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <Trash2 size={12} /> Delete
                  </Button>
                </div>

                {deleteConfirmOpen && (
                  <motion.div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-white mb-2">Type your Store ID to confirm deletion:</p>
                      <p className="text-xs text-white/40 mb-2">This will delete all products, recommendations, and user behavior data.</p>
                      <div className="font-mono text-sm bg-red-500/10 border border-red-500/20 rounded px-3 py-2 text-red-300 mb-3 break-all">
                        {storeId}
                      </div>
                      <Input
                        placeholder="Enter store ID to confirm"
                        value={deleteConfirmText}
                        onChange={(e) => {
                          setDeleteConfirmText(e.target.value)
                          setDeleteError('')
                        }}
                        className="text-xs mb-2"
                      />
                      {deleteError && <p className="text-xs text-red-400 mb-2">{deleteError}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={confirmDeleteData}
                        disabled={deleteConfirmText !== storeId}
                      >
                        Confirm Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteConfirmOpen(false)
                          setDeleteConfirmText('')
                          setDeleteError('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {showUpgradeModal && (
        <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowUpgradeModal(false)}>
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Enterprise Plan</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-white/80">Unlock advanced features:</p>
              <ul className="space-y-2">
                <li className="text-xs text-white/60">✓ Unlimited products & customers</li>
                <li className="text-xs text-white/60">✓ Priority support</li>
                <li className="text-xs text-white/60">✓ Advanced analytics</li>
                <li className="text-xs text-white/60">✓ Custom integrations</li>
              </ul>
              <p className="text-lg font-bold text-white mt-4">$299<span className="text-sm text-white/60">/month</span></p>
            </div>
            <Button variant="glow" className="w-full mb-2">Upgrade Now</Button>
            <Button variant="outline" className="w-full" onClick={() => setShowUpgradeModal(false)}>Close</Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
