import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles, BarChart3, Settings2, RefreshCw, Package, Brain, Download,
} from 'lucide-react'
import { recsApi, widgetApi } from '@/lib/api'
import { useStore } from '@/context/StoreContext'
import { formatNumber, formatPrice } from '@/lib/utils'

export default function RecommendationsPage() {
  const { storeId } = useStore()
  const [engineInfo, setEngineInfo]   = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [widgetConfig, setWidgetConfig] = useState(null)
  const [loading, setLoading]         = useState(true)

  // Gemini retrain state
  const [retraining, setRetraining]   = useState(false)
  const [retrainResult, setRetrainResult] = useState(null)

  // Sklearn build state
  const [buildingSklearn, setBuildingSklearn] = useState(false)
  const [sklearnResult, setSklearnResult]     = useState(null)

  // Engine selection transition
  const [selectingEngine, setSelectingEngine] = useState(null)

  // Model download state
  const [downloadingModel, setDownloadingModel] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [eng, trend, wc] = await Promise.allSettled([
        recsApi.engineInfo(storeId),
        recsApi.trending(storeId, 5),
        widgetApi.getConfig(storeId),
      ])
      if (eng.status   === 'fulfilled') setEngineInfo(eng.value)
      if (trend.status === 'fulfilled') setTopProducts(trend.value.recommendations || [])
      if (wc.status    === 'fulfilled') setWidgetConfig(wc.value)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { load() }, [storeId])

  const handleSelectEngine = async (engine) => {
    if (selectingEngine) return
    setSelectingEngine(engine)
    try {
      await recsApi.selectEngine(storeId, engine)
      await load()
    } catch (err) {
      console.error('Failed to select engine:', err)
    }
    setSelectingEngine(null)
  }

  const handleRetrain = async (e) => {
    e.stopPropagation()
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

  const handleBuildSklearn = async (e) => {
    e.stopPropagation()
    setBuildingSklearn(true)
    setSklearnResult(null)
    try {
      const res = await recsApi.trainSklearn(storeId)
      setSklearnResult(res)
      load()
    } catch (err) {
      setSklearnResult({ error: err.message })
    }
    setBuildingSklearn(false)
  }

  const handleDownloadModel = async (e) => {
    e.stopPropagation()
    setDownloadingModel(true)
    try {
      const blob = await recsApi.exportModel(storeId)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `recoai_model_${storeId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
    setDownloadingModel(false)
  }

  const selectedEngine  = engineInfo?.selected_engine || 'gemini'
  const geminiAvailable = engineInfo?.gemini_available ?? false
  const totalProducts   = engineInfo?.total_products ?? 0
  const totalRecs       = engineInfo?.total_recommendations ?? 0
  const accuracy        = engineInfo?.accuracy ?? 0
  const coverage        = engineInfo?.coverage ?? 0
  const sklearnInfo     = engineInfo?.sklearn

  // ── Engine card definitions ────────────────────────────────────────────────
  const engines = [
    {
      id: 'gemini',
      name: 'Gemini AI',
      tagline: 'Google Gemini LLM',
      description:
        'Uses a large language model to understand product semantics, user preferences, and context for highly relevant, explainable recommendations.',
      Icon: Sparkles,
      accent: 'violet',
      stats: [
        { label: 'API Key', value: geminiAvailable ? '✓ Configured' : '✗ Not configured', ok: geminiAvailable },
        { label: 'Products', value: `${totalProducts} in catalog` },
      ],
      warning: !geminiAvailable
        ? 'Add GEMINI_API_KEY to backend/.env to activate this engine'
        : null,
      actionLabel: retraining ? 'Training…' : 'Retrain with Gemini',
      onAction: handleRetrain,
      actionLoading: retraining,
      resultMsg: retrainResult?.error
        ? `Error: ${retrainResult.error}`
        : retrainResult
        ? `✓ Retrained — ${retrainResult.products_processed ?? 0} products processed`
        : null,
      resultError: !!retrainResult?.error,
    },
    {
      id: 'custom',
      name: 'Sklearn Model',
      tagline: 'TF-IDF + Cosine Similarity',
      description:
        'Offline content-based filtering using TF-IDF vectorisation and cosine similarity scoring. No API key required — runs entirely on your server.',
      Icon: Brain,
      accent: 'cyan',
      stats: [
        {
          label: 'Products Indexed',
          value: sklearnInfo?.products_indexed != null
            ? String(sklearnInfo.products_indexed)
            : totalProducts > 0 ? `${totalProducts} (build to index)` : '0',
        },
        {
          label: 'Vocabulary',
          value: sklearnInfo?.vocabulary_size
            ? `${sklearnInfo.vocabulary_size.toLocaleString()} terms`
            : 'Build to compute',
        },
        ...(sklearnInfo?.avg_cosine_similarity != null
          ? [{ label: 'Avg Similarity', value: `${(sklearnInfo.avg_cosine_similarity * 100).toFixed(1)}%` }]
          : []),
        ...(sklearnInfo?.max_cosine_similarity != null
          ? [{ label: 'Max Similarity', value: `${(sklearnInfo.max_cosine_similarity * 100).toFixed(1)}%` }]
          : []),
      ],
      warning: null,
      actionLabel: buildingSklearn ? 'Building…' : sklearnInfo ? 'Rebuild Model' : 'Build Sklearn Model',
      onAction: handleBuildSklearn,
      actionLoading: buildingSklearn,
      resultMsg: sklearnResult?.error
        ? `Error: ${sklearnResult.error}`
        : sklearnResult
        ? `✓ Model built — ${sklearnResult.products_indexed ?? 0} products, ${(sklearnResult.vocabulary_size ?? 0).toLocaleString()} terms`
        : null,
      resultError: !!sklearnResult?.error,
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Recommendations</h2>
          <p className="text-white/40 text-sm mt-1">
            Choose and configure your AI recommendation engine
          </p>
        </div>
        <Button
          variant="ghost" size="icon"
          className="w-8 h-8 text-white/40 hover:text-white"
          onClick={load} disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {/* ── Engine selection cards ─────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
          Recommendation Engine
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engines.map((eng, idx) => {
            const isActive    = selectedEngine === eng.id
            const isSelecting = selectingEngine === eng.id
            const { Icon }    = eng

            const borderCls = isActive
              ? eng.accent === 'violet'
                ? 'border-violet-500/60 bg-violet-500/5 shadow-[0_0_28px_-6px_rgba(139,92,246,0.3)]'
                : 'border-cyan-500/60 bg-cyan-500/5 shadow-[0_0_28px_-6px_rgba(6,182,212,0.3)]'
              : 'border-white/10 bg-white/[0.02] hover:border-white/20'

            const accentText  = eng.accent === 'violet' ? 'text-violet-400' : 'text-cyan-400'
            const accentBg    = eng.accent === 'violet' ? 'bg-violet-500/15 border-violet-500/20' : 'bg-cyan-500/15 border-cyan-500/20'
            const badgeCls    = eng.accent === 'violet'
              ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'

            return (
              <motion.div
                key={eng.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200 ${borderCls} ${!isActive ? 'cursor-pointer' : ''}`}
                onClick={() => !isActive && !isSelecting && handleSelectEngine(eng.id)}
              >
                {/* Active badge */}
                {isActive && (
                  <span className={`absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeCls}`}>
                    Active
                  </span>
                )}

                {/* Title row */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${accentBg}`}>
                    <Icon size={16} className={accentText} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{eng.name}</p>
                    <p className={`text-xs ${accentText}`}>{eng.tagline}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-white/50 leading-relaxed">{eng.description}</p>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2">
                  {eng.stats.map((s) => (
                    <div key={s.label} className="rounded-lg bg-white/5 px-3 py-2">
                      <p className="text-[10px] text-white/40 mb-0.5">{s.label}</p>
                      <p className={`text-xs font-medium ${s.ok === true ? 'text-emerald-400' : s.ok === false ? 'text-red-400' : 'text-white'}`}>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Warning callout */}
                {eng.warning && (
                  <p className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    ⚠ {eng.warning}
                  </p>
                )}

                {/* Action result banner */}
                {eng.resultMsg && (
                  <p className={`text-xs px-3 py-2 rounded-lg border ${eng.resultError ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    {eng.resultMsg}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 mt-auto pt-1" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isActive && eng.accent === 'violet' ? 'glow' : 'outline'}
                      size="sm"
                      className={`flex-1 text-xs ${isActive && eng.accent === 'cyan' ? 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10' : ''}`}
                      onClick={eng.onAction}
                      disabled={eng.actionLoading}
                    >
                      {eng.actionLoading
                        ? <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />{eng.actionLabel}</span>
                        : <span className="flex items-center gap-1.5"><Icon size={12} />{eng.actionLabel}</span>}
                    </Button>
                    {!isActive && (
                      <Button
                        variant="ghost" size="sm"
                        className="text-xs text-white/40 hover:text-white shrink-0"
                        onClick={() => handleSelectEngine(eng.id)}
                        disabled={!!selectingEngine}
                      >
                        {isSelecting
                          ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          : 'Use this'}
                      </Button>
                    )}
                  </div>
                  {/* Download Model — sklearn only, once model is built */}
                  {eng.id === 'custom' && sklearnInfo?.status === 'built' && (
                    <Button
                      variant="outline" size="sm"
                      className="w-full text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                      onClick={handleDownloadModel}
                      disabled={downloadingModel}
                    >
                      {downloadingModel
                        ? <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Downloading…</span>
                        : <span className="flex items-center gap-1.5"><Download size={12} />Download Model (JSON)</span>}
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Sklearn top TF-IDF terms (shown after model is built) ─────────── */}
      {sklearnInfo?.sample_terms?.length > 0 && (
        <Card className="glass-card">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-cyan-400 mb-3 flex items-center gap-2">
              <Brain size={12} /> Top TF-IDF features (highest document frequency)
            </p>
            <div className="flex flex-wrap gap-2">
              {sklearnInfo.sample_terms.map((term) => (
                <span
                  key={term}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60"
                >
                  {term}
                </span>
              ))}
            </div>
            {sklearnInfo.built_at && (
              <p className="text-[10px] text-white/20 mt-3">
                Built {new Date(sklearnInfo.built_at).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${selectedEngine === 'gemini' ? 'bg-violet-400' : 'bg-cyan-400'}`} />
              <span className={`text-xs font-medium ${selectedEngine === 'gemini' ? 'text-violet-400' : 'text-cyan-400'}`}>
                {selectedEngine === 'gemini' ? 'Gemini AI' : 'Sklearn'} · Active
              </span>
            </div>
            <p className="text-sm text-white/60 mb-2">Engine</p>
            <p className="text-2xl font-bold text-white">
              {selectedEngine === 'custom' ? 'Sklearn' : 'Gemini'}
            </p>
            <p className="text-xs text-white/30 mt-1">{totalProducts} products in catalog</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5">
            <p className="text-xs text-violet-400 font-medium mb-2">Accuracy Score</p>
            <p className="text-2xl font-bold text-white">{loading ? '—' : `${accuracy}%`}</p>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all"
                style={{ width: `${accuracy}%` }}
              />
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

      {/* ── Top trending products ──────────────────────────────────────────── */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <BarChart3 size={16} className="text-violet-400" />
            Top Trending Products
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((rec, i) => {
                const p   = rec.product
                const ctr = p.click_count > 0
                  ? ((p.conversion_count / p.click_count) * 100).toFixed(1)
                  : '0.0'
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        : <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <Package size={14} className="text-white/20" />
                          </div>
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

      {/* ── Widget config ─────────────────────────────────────────────────── */}
      <Card className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Settings2 size={16} className="text-violet-400" />
          Widget Configuration
        </h3>
        {widgetConfig ? (
          <div className="space-y-3">
            {[
              { label: 'Widget Type', value: widgetConfig.widget_type },
              { label: 'Theme',       value: widgetConfig.theme },
              { label: 'Max Items',   value: String(widgetConfig.max_items) },
              { label: 'Widget Token', value: widgetConfig.widget_token?.slice(0, 16) + '…' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <p className="text-sm text-white">{item.label}</p>
                <Badge variant="secondary" className="text-xs capitalize">{item.value}</Badge>
              </div>
            ))}
            <p className="text-xs text-white/30 mt-1">
              Configure widget appearance on the{' '}
              <a href="/dashboard/embed" className="text-violet-400 hover:underline">Embed Widget</a> page.
            </p>
          </div>
        ) : (
          <p className="text-sm text-white/30 text-center py-4">
            {loading ? 'Loading…' : 'No widget configured yet'}
          </p>
        )}
      </Card>

    </div>
  )
}
