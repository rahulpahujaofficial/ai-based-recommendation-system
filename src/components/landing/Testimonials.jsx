import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TESTIMONIALS } from '@/data/mockData'

export default function Testimonials() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 font-syne">
            Loved by <span className="gradient-text">Shopify Stores</span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">See how real stores are using RecoAI to boost revenue</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div key={testimonial.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full hover:border-white/15 transition-all duration-200">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white/80 mb-6 leading-relaxed">{testimonial.text}</p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                      <p className="text-xs text-white/40">{testimonial.role}</p>
                      <p className="text-xs text-violet-400">{testimonial.company}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-center">
                    <p className="text-sm font-bold text-violet-400">{testimonial.stats}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
