import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, BarChart3, Settings2, RefreshCw, CheckCircle2, Package } from 'lucide-react'
import { recsApi, widgetApi } from '@/lib/api'
import { useStore } from '@/context/StoreContext'
import { formatNumber, formatPrice } from '@/lib/utils'

export default function RecommendationsPage() {
  const { storeId } = useStore()
  const [engineInfo, setEngineInfo] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [widgetConfig, setWidgetConfig] = useState(null)
  const [retraining, setRetraining] = useState(false)
  const [retrainResult, setRetrainResult] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [eng, trend, wc] = await Promise.allSettled([
        recsApi.engineInfo(storeId),
        recsApi.trending(storeId, 5),
        widgetApi.getConfig(storeId),
      ])
      if (eng.status === 'fulfilled') setEngineInfo(eng.value)
      if (trend.status === 'fulfilled') setTopProducts(trend.value.recommendations || [])
      if (wc.status === 'fulfilled') setWidgetConfig(wc.value)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { load() }, [storeId])

  const handleRetrain = async () => {
    setRetraining(true)
    setRetrainResult(null)
    try {
      const res = await recsApi.retrain(storeId)
      setRetrainResult(res)
      load()
    } catch (err) {
      setRetrainResult({ error: err.message })
    }
    setRetraining(false)
  }

  const accuracy = engineInfo?.accuracy ?? 0
  const coverage = engineInfo?.coverage ?? 0
  const totalProducts = engineInfo?.total_products ?? 0
  const totalRecs = engineInfo?.total_recommendations ?? 0
  const engine = engineInfo?.engine || 'custom'
  const geminiAvailable = engineInfo?.gemini_available ?? false

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Recommendations</h2>
          <p className="text-white/40 text-sm mt-1">AI engine status and training</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-white/40 hover:text-white" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="glow" size="sm" onClick={handleRetrain} disabled={retraining}>
            {retraining
              ? <span className="flex items-center gap-2"><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Training…</span>
              : <><Sparkles size={14} /> Retrain AI</>}
          </Button>
        </div>
      </div>

      {retrainResult && (
        <div className={`rounded-xl px-4 py-3 text-sm border ${retrainResult.error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {retrainResult.error
            ? `Error: ${retrainResult.error}`
            : `✓ Retraining complete — ${retrainResult.products_processed} products processed using ${retrainResult.engine} engine.`}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${geminiAvailable ? 'bg-violet-400' : 'bg-emerald-400'}`} />
              <span className={`text-xs font-medium ${geminiAvailable ? 'text-violet-400' : 'text-emerald-400'}`}>
                {geminiAvailable ? 'Gemini AI' : 'Custom Model'} · Active
              </span>
            </div>
            <p className="text-sm text-white/60 mb-2">Engine</p>
            <p className="text-2xl font-bold text-white capitalize">{engine}</p>
            <p className="text-xs text-white/30 mt-1">Trained on {totalProducts} products</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5">
            <p className="text-xs text-violet-400 font-medium mb-2">Accuracy Score</p>
            <p className="text-2xl font-bold text-white">{loading ? '—' : `${accuracy}%`}</p>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all" style={{ width: `${accuracy}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5">
            <p className="text-xs text-cyan-400 font-medium mb-2">Recommendations Generated</p>
            <p className="text-2xl font-bold text-white">{loading ? '—' : formatNumber(totalRecs)}</p>
            <p className="text-xs text-white/30 mt-1">Coverage: {coverage}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Top performing products */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <BarChart3 size={16} className="text-violet-400" />
            Top Trending Products
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((rec, i) => {
                const p = rec.product
                const ctr = p.click_count > 0 ? ((p.conversion_count / p.click_count) * 100).toFixed(1) : '0.0'
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        : <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0"><Package size={14} className="text-white/20" /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.name}</p>
                        <p className="text-xs text-white/40">{p.category} · {formatPrice(p.price)}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block mr-3">
                      <p className="text-sm font-bold text-emerald-400">{ctr}%</p>
                      <p className="text-xs text-white/30">conversion</p>
                    </div>
                    <Badge variant="success" className="text-[10px]">{p.click_count || 0} clicks</Badge>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-white/30 text-center py-6">
              {loading ? 'Loading…' : 'Add products and track events to see top performers here'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Widget / AI Config */}
      <Card className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Settings2 size={16} className="text-violet-400" />
          Widget Configuration
        </h3>
        {widgetConfig ? (
          <div className="space-y-3">
            {[
              { label: 'Widget Type', value: widgetConfig.widget_type },
              { label: 'Theme', value: widgetConfig.theme },
              { label: 'Max Items', value: String(widgetConfig.max_items) },
              { label: 'Widget Token', value: widgetConfig.widget_token?.slice(0, 16) + '…' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white">{item.label}</p>
                <Badge variant="secondary" className="text-xs capitalize">{item.value}</Badge>
              </div>
            ))}
            <p className="text-xs text-white/30 mt-1">Configure widget appearance on the <a href="/dashboard/embed" className="text-violet-400 hover:underline">Embed Widget</a> page.</p>
          </div>
        ) : (
          <p className="text-sm text-white/30 text-center py-4">{loading ? 'Loading…' : 'No widget configured yet'}</p>
        )}
      </Card>
    </div>
  )
}
