import { motion } from 'framer-motion'
import { Brain, Zap, BarChart3, Palette, Shield, Globe } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { FEATURES } from '@/data/mockData'

const iconMap = { Brain, Zap, BarChart3, Palette, Shield, Globe }

const colorMap = {
  violet: { bg: 'bg-violet-500/15', icon: 'text-violet-400', border: 'border-violet-500/20', glow: 'shadow-violet-900/30' },
  cyan: { bg: 'bg-cyan-500/15', icon: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'shadow-cyan-900/30' },
  pink: { bg: 'bg-pink-500/15', icon: 'text-pink-400', border: 'border-pink-500/20', glow: 'shadow-pink-900/30' },
  amber: { bg: 'bg-amber-500/15', icon: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-amber-900/30' },
  green: { bg: 'bg-emerald-500/15', icon: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-900/30' },
  blue: { bg: 'bg-blue-500/15', icon: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-900/30' },
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="orb orb-violet w-96 h-96 -top-20 -left-20 opacity-20" />
      <div className="orb orb-cyan w-80 h-80 bottom-0 right-0 opacity-15" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-4">
            Everything You Need
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Built for <span className="gradient-text">serious stores</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Every feature you need to transform browsers into buyers — out of the box, zero configuration required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = iconMap[feature.icon]
            const colors = colorMap[feature.color]
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className={`glass-card-hover h-full p-6 group hover:shadow-xl transition-all duration-300 hover:${colors.glow} border ${colors.border}/30`}>
                  <CardContent className="p-0">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`${colors.icon} w-5 h-5`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
