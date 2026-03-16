import { motion } from 'framer-motion'
import { ANALYTICS_DATA } from '@/data/mockData'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="text-white/40 text-sm mt-1">Track AI recommendations performance in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clicks by day */}
        <Card className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Clicks by Day</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ANALYTICS_DATA.clicks} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" />
              <YAxis stroke="rgba(255,255,255,0.2)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category distribution */}
        <Card className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Recommendations by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={ANALYTICS_DATA.categoryPerformance} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {ANALYTICS_DATA.categoryPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Conversion funnel */}
      <Card className="glass-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Conversion Funnel</h3>
        <div className="space-y-3">
          {ANALYTICS_DATA.conversionFunnel.map((stage, i) => (
            <motion.div key={stage.stage} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-medium text-white w-24">{stage.stage}</span>
                <span className="text-sm text-white/50">{(stage.value / 1000).toFixed(1)}k</span>
                <span className="text-xs text-white/30 ml-auto">{((stage.value / 100000) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(stage.value / 100000) * 100}%`, backgroundColor: stage.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg. CTR', value: '8.4%', change: '+1.2%' },
          { label: 'Conv. Rate', value: '2.7%', change: '+0.4%' },
          { label: 'AOV Impact', value: '+$42.50', change: '+15%' },
          { label: 'Revenue', value: '$31.2k', change: '+18.2%' },
        ].map((metric) => (
          <Card key={metric.label} className="glass-card p-4">
            <p className="text-xs text-white/50 mb-1">{metric.label}</p>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <Badge variant="success" className="text-xs py-0">{metric.change}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
