import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ExternalLink, Settings, Plus } from 'lucide-react'

const integrations = [
  { name: 'Shopify', status: 'connected', icon: '🛍️', desc: 'Sync products & orders automatically' },
  { name: 'Stripe', status: 'connected', icon: '💳', desc: 'Payment processing & analytics' },
  { name: 'Segment', status: 'available', icon: '🎯', desc: 'Track user behavior & events' },
  { name: 'Slack', status: 'available', icon: '💬', desc: 'Receive daily alerts & reports' },
  { name: 'Google Analytics', status: 'available', icon: '📊', desc: 'Export performance data' },
  { name: 'Zapier', status: 'available', icon: '⚡', desc: 'Connect with 1000+ apps' },
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Integrations</h2>
          <p className="text-white/40 text-sm mt-1">Connect RecoAI with your favorite tools</p>
        </div>
        <Button variant="glow" size="sm"><Plus size={14} /> Add Integration</Button>
      </div>

      {/* Connected integrations */}
      <Card className="glass-card p-6 border-emerald-500/20">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Connected</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations
            .filter((i) => i.status === 'connected')
            .map((integration, idx) => (
              <motion.div key={integration.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="font-medium text-white">{integration.name}</p>
                    <p className="text-xs text-white/50">{integration.desc}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  <Settings size={12} />
                </Button>
              </motion.div>
            ))}
        </div>
      </Card>

      {/* Available integrations */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations
            .filter((i) => i.status === 'available')
            .map((integration, idx) => (
              <motion.div key={integration.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                <Card className="glass-card h-full hover:border-white/20 transition-all cursor-pointer group">
                  <CardContent className="p-5 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{integration.icon}</span>
                      <ExternalLink size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                    </div>
                    <p className="font-medium text-white mb-1">{integration.name}</p>
                    <p className="text-xs text-white/50 flex-1">{integration.desc}</p>
                    <Button variant="outline" size="sm" className="w-full mt-4 text-xs">Connect</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </div>

      {/* API Documentation */}
      <Card className="glass-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">API & Webhooks</h3>
        <p className="text-white/50 text-sm mb-4">Build custom integrations using our REST API</p>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full text-left justify-start">📚 Read API Documentation</Button>
          <Button variant="outline" size="sm" className="w-full text-left justify-start">🔑 Manage API Keys</Button>
          <Button variant="outline" size="sm" className="w-full text-left justify-start">🪝 Webhook Settings</Button>
        </div>
      </Card>
    </div>
  )
}
