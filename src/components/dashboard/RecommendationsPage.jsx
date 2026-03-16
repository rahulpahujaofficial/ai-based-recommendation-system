import { motion } from 'framer-motion'
import { MOCK_PRODUCTS, ANALYTICS_DATA } from '@/data/mockData'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, BarChart3, Settings2, Play, Pause } from 'lucide-react'

export default function RecommendationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Recommendations</h2>
          <p className="text-white/40 text-sm mt-1">AI engine status and training</p>
        </div>
        <Button variant="glow" size="sm"><Sparkles size={14} /> Retrain AI</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">Active</span>
            </div>
            <p className="text-sm text-white/60 mb-2">Model Status</p>
            <p className="text-2xl font-bold text-white">v2.4 Active</p>
            <p className="text-xs text-white/30 mt-1">Trained on 8 products</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5">
            <p className="text-xs text-violet-400 font-medium mb-2">Accuracy</p>
            <p className="text-2xl font-bold text-white">94.2%</p>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
              <div className="w-[94.2%] h-full bg-gradient-to-r from-violet-500 to-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5">
            <p className="text-xs text-cyan-400 font-medium mb-2">Training Data</p>
            <p className="text-2xl font-bold text-white">8.2k events</p>
            <p className="text-xs text-white/30 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <BarChart3 size={16} className="text-violet-400" />
            Best Performing Recommendations
          </h3>
          <div className="space-y-3">
            {MOCK_PRODUCTS.slice(0, 3).map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-white/40">{p.category}</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-emerald-400">{((p.conversions / p.clicks) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-white/30">conversion</p>
                </div>
                <Badge variant="success" className="ml-2 text-[10px]">{p.conversions} sales</Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Settings2 size={16} className="text-violet-400" />
          AI Configuration
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Personalization Level', value: 'High', color: 'violet' },
            { label: 'Diversity Score', value: '72%', color: 'cyan' },
            { label: 'Freshness', value: 'Real-time', color: 'pink' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <p className="text-sm text-white">{item.label}</p>
              <Badge variant="secondary" className="text-xs">{item.value}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
