import { Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Package, Sparkles, MousePointerClick,
  ShoppingCart, ArrowRight, Eye, Zap, Activity, RefreshCw
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatPrice, formatNumber } from '@/lib/utils'
import { analyticsApi, recsApi } from '@/lib/api'
import { useStore } from '@/context/StoreContext'
import DashboardCanvas from '@/components/three/DashboardCanvas'

const colorConfig = {
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
  violet: { bg: 'bg-violet-500/10', icon: 'text-violet-400', border: 'border-violet-500/20' },
  cyan: { bg: 'bg-cyan-500/10', icon: 'text-cyan-400', border: 'border-cyan-500/20' },
  amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card rounded-xl px-3 py-2 border border-white/10">
        <p className="text-xs text-white/50 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardOverview() {
  const navigate = useNavigate()
  const { storeId, store } = useStore()
  const [summary, setSummary] = useState(null)
  const [trending, setTrending] = useState([])
  const [engineInfo, setEngineInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [sum, trendData, eng] = await Promise.allSettled([
        analyticsApi.summary(storeId, 30),
        recsApi.trending(storeId, 4),
        recsApi.engineInfo(storeId),
      ])
      if (sum.status === 'fulfilled') setSummary(sum.value)
      if (trendData.status === 'fulfilled') setTrending(trendData.value.recommendations || [])
      if (eng.status === 'fulfilled') setEngineInfo(eng.value)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { load() }, [storeId])

  const clicks = summary?.events?.click || 0
  const purchases = summary?.events?.purchase || 0
  const totalRecs = summary?.total_recommendations_generated || 0
  const totalProducts = summary?.total_products || 0
  const ctr = totalRecs > 0 ? ((clicks / totalRecs) * 100).toFixed(1) : '0.0'

  const stats = [
    { label: 'Total Products', value: formatNumber(totalProducts), change: 'in catalog', up: true, icon: Package, color: 'emerald', sub: 'active products' },
    { label: 'Recommendations', value: formatNumber(totalRecs), change: 'generated', up: true, icon: Sparkles, color: 'violet', sub: 'all time' },
    { label: 'Click-Through Rate', value: `${ctr}%`, change: 'from recs', up: parseFloat(ctr) > 0, icon: MousePointerClick, color: 'cyan', sub: 'clicks / recs' },
    { label: 'Conversions', value: formatNumber(purchases), change: 'tracked', up: purchases > 0, icon: ShoppingCart, color: 'amber', sub: 'from recommendations' },
  ]

  // Build chart data from daily events
  const chartData = summary?.daily_events?.map((d) => ({
    month: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    value: d.count,
  })) || []

  const engineMetrics = [
    { label: 'Model Accuracy', value: engineInfo?.accuracy || 70, color: 'violet' },
    { label: 'Coverage', value: engineInfo?.coverage || 60, color: 'cyan' },
    { label: 'Speed', value: 99, color: 'green' },
  ]

  const storeName = store?.name || storeId

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Good morning, {storeName} 👋</h2>
          <p className="text-white/40 text-sm mt-1">Here's what's happening with your store today</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-white/40 hover:text-white" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="glow" size="sm" onClick={() => navigate('/dashboard/embed')}>
            <Zap size={14} /> New Campaign
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          const colors = colorConfig[stat.color]
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className={`glass-card border ${colors.border}/20 p-5 hover:border-white/15 transition-all duration-200`}>
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                      <Icon size={16} className={colors.icon} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stat.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white mb-0.5">{loading ? '—' : stat.value}</p>
                  <p className="text-xs text-white/40">{stat.label}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{stat.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="glass-card xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Daily Events (Last 30 Days)</h3>
              <p className="text-xs text-white/40 mt-0.5">Clicks, views and interactions</p>
            </div>
            <Badge variant="success">Live</Badge>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-white/20 text-sm">
              No event data yet — start tracking interactions to see charts
            </div>
          )}
        </Card>

        {/* AI Engine */}
        <Card className="glass-card p-6 overflow-hidden relative">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h3 className="text-sm font-semibold text-white">AI Engine Status</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-emerald-400">
                  {engineInfo ? `${engineInfo.engine} · ${engineInfo.model_version}` : 'Active'}
                </p>
              </div>
            </div>
          </div>
          <div className="h-40 relative z-0">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-white/20 text-sm">Loading 3D...</div>}>
              <DashboardCanvas />
            </Suspense>
          </div>
          <div className="relative z-10 space-y-2 mt-2">
            {engineMetrics.map((m) => (
              <div key={m.label} className="flex items-center gap-2">
                <span className="text-xs text-white/40 w-28 shrink-0">{m.label}</span>
                <Progress value={m.value} color={m.color} className="flex-1" />
                <span className="text-xs text-white/60 w-8 text-right">{m.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="glass-card xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white">Top Recommended Products</h3>
            <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300" onClick={() => navigate('/dashboard/products')}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          <div className="space-y-3">
            {trending.length > 0 ? trending.map((rec, i) => {
              const p = rec.product
              return (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/30">{i + 1}</div>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    : <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><Package size={14} className="text-white/20" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-white/40">{p.category}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-white">{formatNumber(p.click_count || 0)}</p>
                    <p className="text-xs text-white/40">clicks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-400">{p.conversion_count || 0}</p>
                    <p className="text-xs text-white/40">converts</p>
                  </div>
                </div>
              )
            }) : (
              <div className="py-8 text-center text-white/20 text-sm">
                {loading ? 'Loading products…' : 'Add products to see recommendations here'}
              </div>
            )}
          </div>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-5">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { icon: Package, label: 'Add Products', desc: 'Upload your catalog', href: '/dashboard/products', color: 'violet' },
              { icon: Sparkles, label: 'Train AI', desc: 'Update recommendations', href: '/dashboard/recommendations', color: 'cyan' },
              { icon: Activity, label: 'View Analytics', desc: 'Track performance', href: '/dashboard/analytics', color: 'pink' },
              { icon: Eye, label: 'Preview Widget', desc: 'Test your embed', href: '/dashboard/embed', color: 'amber' },
            ].map((action) => {
              const Icon = action.icon
              const colors = colorConfig[action.color] || colorConfig.violet
              return (
                <button key={action.label} onClick={() => navigate(action.href)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group">
                  <div className={`w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={15} className={colors.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{action.label}</p>
                    <p className="text-xs text-white/40">{action.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </button>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
