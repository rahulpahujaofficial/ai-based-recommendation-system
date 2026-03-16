import { motion } from 'framer-motion'
import { FEATURES } from '@/data/mockData'
import { Card, CardContent } from '@/components/ui/card'
import * as Icons from 'lucide-react'

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 font-syne">
            Powerful Features for <span className="gradient-text">Modern Stores</span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">Everything you need to build a recommendation engine that converts</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = Icons[feature.icon]
            const colorMap = {
              violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
              cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
              pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
              amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
              green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
              blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
            }
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full hover:border-white/15 transition-all duration-200 group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${colorMap[feature.color]} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {Icon && <Icon size={20} />}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
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
