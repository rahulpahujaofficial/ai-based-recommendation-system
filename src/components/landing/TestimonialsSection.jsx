import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { TESTIMONIALS } from '@/data/mockData'

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-20" />
      <div className="orb orb-pink w-64 h-64 bottom-0 left-0 opacity-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-sm font-medium mb-4">
            Customer Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Stores that <span className="gradient-text">love RecoAI</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Join 2,400+ Shopify stores already boosting revenue with AI recommendations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass-card-hover rounded-2xl p-6 flex flex-col gap-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <Quote size={20} className="text-violet-400/40" />
              </div>

              <p className="text-sm text-white/70 leading-relaxed flex-1">"{testimonial.text}"</p>

              <div className="pt-4 border-t border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{testimonial.name}</p>
                    <p className="text-xs text-white/40">{testimonial.role} · {testimonial.company}</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  {testimonial.stats}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-white/8"
        >
          {[
            { value: '2,400+', label: 'Active Stores', color: 'text-violet-400' },
            { value: '$48M+', label: 'Revenue Driven', color: 'text-emerald-400' },
            { value: '1.2B+', label: 'Recommendations Served', color: 'text-cyan-400' },
            { value: '38%', label: 'Avg AOV Increase', color: 'text-amber-400' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className={`text-3xl md:text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
              <p className="text-sm text-white/40">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
