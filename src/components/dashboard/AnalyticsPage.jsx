import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { analyticsApi } from '@/lib/api'
import { useStore } from '@/context/StoreContext'
import { formatNumber } from '@/lib/utils'

const PIE_COLORS = ['#8b5cf6', '#22d3ee', '#ec4899', '#f59e0b', '#10b981', '#6366f1']

const DAYS_OPTIONS = [7, 14, 30, 90]

export default function AnalyticsPage() {
  const { storeId } = useStore()
  const [summary, setSummary] = useState(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await analyticsApi.summary(storeId, days)
      setSummary(data)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { load() }, [storeId, days])

  // ── Derived data ──────────────────────────────────────────────────────────
  const dailyData = summary?.daily_events?.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    value: d.count,
  })) || []

  // Category breakdown from top_products
  const categoryMap = {}
  for (const p of summary?.top_products || []) {
    const cat = p.category || 'Other'
    categoryMap[cat] = (categoryMap[cat] || 0) + (p.click_count || 0) + 1
  }
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  const events = summary?.events || {}
  const views = events.view || 0
  const clicks = events.click || 0
  const addToCart = events.add_to_cart || 0
  const purchases = events.purchase || 0
  const total = Math.max(views, clicks, addToCart, purchases, 1)

  const funnel = [
    { stage: 'Views', value: views, color: '#8b5cf6' },
    { stage: 'Clicks', value: clicks, color: '#22d3ee' },
    { stage: 'Add to Cart', value: addToCart, color: '#f59e0b' },
    { stage: 'Purchase', value: purchases, color: '#10b981' },
  ]

  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0'
  const convRate = clicks > 0 ? ((purchases / clicks) * 100).toFixed(1) : '0.0'
  const totalProducts = summary?.total_products || 0
  const totalRecs = summary?.total_recommendations_generated || 0

  const metrics = [
    { label: 'Products', value: formatNumber(totalProducts), change: 'in catalog' },
    { label: 'Click-Through', value: `${ctr}%`, change: 'clicks / views' },
    { label: 'Conv. Rate', value: `${convRate}%`, change: 'purchases / clicks' },
    { label: 'Total Recs', value: formatNumber(totalRecs), change: 'generated' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-white/40 text-sm mt-1">Track AI recommendations performance in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          {DAYS_OPTIONS.map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${days === d ? 'bg-violet-600 text-white' : 'glass-card text-white/50 hover:text-white'}`}>
              {d}d
            </button>
          ))}
          <Button variant="ghost" size="icon" className="w-8 h-8 text-white/40 hover:text-white" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="glass-card p-4">
            <p className="text-xs text-white/50 mb-1">{metric.label}</p>
            <div className="flex items-end gap-2 mb-1">
              <p className="text-2xl font-bold text-white">{loading ? '—' : metric.value}</p>
            </div>
            <p className="text-xs text-white/30">{metric.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Day */}
        <Card className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Events by Day</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-white/20 text-sm">
              {loading ? 'Loading…' : 'No events in this period yet'}
            </div>
          )}
        </Card>

        {/* Category breakdown */}
        <Card className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Products by Category</h3>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={categoryData} innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {categoryData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-white/60 truncate">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-white/20 text-sm">
              {loading ? 'Loading…' : 'No product data yet'}
            </div>
          )}
        </Card>
      </div>

      {/* Conversion funnel */}
      <Card className="glass-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Conversion Funnel</h3>
        <div className="space-y-3">
          {funnel.map((stage, i) => (
            <motion.div key={stage.stage} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-medium text-white w-24">{stage.stage}</span>
                <span className="text-sm text-white/50">{formatNumber(stage.value)}</span>
                <span className="text-xs text-white/30 ml-auto">{total > 0 ? ((stage.value / total) * 100).toFixed(1) : '0.0'}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${total > 0 ? (stage.value / total) * 100 : 0}%`, backgroundColor: stage.color }} />
              </div>
            </motion.div>
          ))}
        </div>
        {!views && !clicks && !purchases && !loading && (
          <p className="text-xs text-white/30 text-center mt-4">
            No events tracked yet. Embed the widget and start getting clicks to see funnel data.
          </p>
        )}
      </Card>

      {/* Top products table */}
      {summary?.top_products?.length > 0 && (
        <Card className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Top Products by Engagement</h3>
          <div className="space-y-2">
            {summary.top_products.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <span className="text-xs font-bold text-white/20 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-white/40">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-white">{formatNumber(p.click_count || 0)} clicks</p>
                  <p className="text-[10px] text-white/30">{p.conversion_count || 0} sales</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
