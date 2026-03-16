import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, CreditCard, Shield, Palette, Globe, Save, Check, Store, ChevronRight, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

function Toggle({ defaultChecked = false, label, desc }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-white/40 mt-0.5">{desc}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="sr-only peer" />
        <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600" />
      </label>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-white/40 text-sm mt-1">Manage your account and preferences</p>
        </div>
        <Button variant="glow" size="sm" onClick={handleSave}>
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <Tabs>
        <TabsList className="flex-wrap gap-1">
          {[
            { id: 'account', label: 'Account', icon: User },
            { id: 'store', label: 'Store', icon: Store },
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

        {activeTab === 'account' && (
          <TabsContent active={true}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-base font-semibold text-white mb-5">Profile Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">First Name</Label>
                      <Input defaultValue="Alex" />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Last Name</Label>
                      <Input defaultValue="Johnson" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Email Address</Label>
                    <Input defaultValue="alex@mystore.com" type="email" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Company</Label>
                    <Input defaultValue="My Shopify Store" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Timezone</Label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                      <option className="bg-gray-900">UTC-5 (Eastern Time)</option>
                      <option className="bg-gray-900">UTC (London)</option>
                      <option className="bg-gray-900">UTC+5:30 (India)</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-5">Avatar</h3>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-2xl font-bold text-white">
                    AJ
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">Change Avatar</Button>
                  <div className="w-full pt-4 border-t border-white/8">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <CreditCard size={13} className="text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">Growth Plan</p>
                        <p className="text-[10px] text-white/40">$79/month · Renews Apr 16</p>
                      </div>
                    </div>
                    <Badge variant="default" className="text-[10px] w-full justify-center">Active</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        )}

        {activeTab === 'store' && (
          <TabsContent active={true}>
            <Card className="glass-card p-6">
              <h3 className="text-base font-semibold text-white mb-5">Store Configuration</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Store URL</Label>
                  <div className="flex items-center gap-2">
                    <Input defaultValue="mystore.myshopify.com" className="font-mono text-xs" />
                    <Button variant="outline" size="sm" className="shrink-0">Verify</Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Default Recommendation Count</Label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                    {[2, 3, 4, 6, 8].map(n => <option key={n} className="bg-gray-900">{n} products</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Currency</Label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
                    <option className="bg-gray-900">USD ($)</option>
                    <option className="bg-gray-900">EUR (€)</option>
                    <option className="bg-gray-900">GBP (£)</option>
                  </select>
                </div>
                <div className="pt-4 border-t border-white/8">
                  <h4 className="text-sm font-medium text-white mb-3">AI Behavior</h4>
                  <div className="space-y-0">
                    <Toggle defaultChecked label="Auto-retrain model" desc="Retrain AI every 24 hours automatically" />
                    <Toggle defaultChecked label="Exclude out-of-stock" desc="Never show products with zero inventory" />
                    <Toggle label="Cross-sell only" desc="Only recommend products from different categories" />
                    <Toggle defaultChecked label="Price range filter" desc="Limit recommendations to ±50% of current product price" />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}

        {activeTab === 'notifications' && (
          <TabsContent active={true}>
            <Card className="glass-card p-6">
              <h3 className="text-base font-semibold text-white mb-5">Notification Preferences</h3>
              <div className="space-y-0">
                <Toggle defaultChecked label="Weekly performance report" desc="Summary of recommendations and revenue every Monday" />
                <Toggle defaultChecked label="AI model retrained" desc="Alert when AI updates its recommendation model" />
                <Toggle label="Low credit warning" desc="Notify when AI credits drop below 1,000" />
                <Toggle defaultChecked label="Integration errors" desc="Immediate alerts when Shopify sync fails" />
                <Toggle label="New product import" desc="Confirm when product catalog is successfully imported" />
                <Toggle defaultChecked label="Conversion milestones" desc="Celebrate when you hit 100, 500, 1000 conversions" />
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
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Products', used: '8', limit: '5,000' },
                    { label: 'Recommendations', used: '124K', limit: '100K/mo' },
                    { label: 'Widgets', used: '2', limit: 'Unlimited' },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 rounded-xl bg-white/5 border border-white/8">
                      <p className="text-sm font-bold text-white">{item.used}</p>
                      <p className="text-[10px] text-white/30">{item.label}</p>
                      <p className="text-[10px] text-white/20">of {item.limit}</p>
                    </div>
                  ))}
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
                  <div>
                    <Label className="text-xs mb-1.5 block">Current Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Confirm Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Button variant="glow" size="sm" className="mt-2">Update Password</Button>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-3 rounded-xl glass-card border border-white/10">
                  <div>
                    <p className="text-sm font-medium text-white">Authenticator App</p>
                    <p className="text-xs text-white/40">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">Enable 2FA</Button>
                </div>
              </Card>

              <Card className="glass-card p-6 border border-red-500/20">
                <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                    <div>
                      <p className="text-sm font-medium text-white">Delete Account</p>
                      <p className="text-xs text-white/40">This action is irreversible</p>
                    </div>
                    <Button variant="destructive" size="sm" className="text-xs bg-red-900/50 text-red-400 border border-red-500/30 hover:bg-red-900/70">
                      <Trash2 size={12} /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
