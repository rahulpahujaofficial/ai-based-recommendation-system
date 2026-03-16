import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { PLANS } from '@/data/mockData'

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 px-6 relative overflow-hidden">
      <div className="orb orb-violet w-96 h-96 top-0 left-1/2 -translate-x-1/2 opacity-10" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-4">
            Simple Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Start free, <span className="gradient-text">scale unlimited</span>
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-8">
            14-day free trial on all plans. No credit card required.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl glass-card border border-white/10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${!isAnnual ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${isAnnual ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'}`}
            >
              Annual
              <Badge variant="success" className="text-[10px] py-0">-20%</Badge>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl ${plan.highlighted
                ? 'bg-gradient-to-b from-violet-600/20 to-purple-900/20 border-2 border-violet-500/50 shadow-xl shadow-violet-900/30'
                : 'glass-card'
              } p-6 flex flex-col`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-white/40 mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${isAnnual ? Math.round(plan.price * 0.8) : plan.price}
                  </span>
                  <span className="text-white/40 text-sm pb-1">/{plan.period}</span>
                </div>
                {isAnnual && <p className="text-xs text-emerald-400 mt-1">Save ${Math.round(plan.price * 0.2 * 12)}/year</p>}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check size={14} className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-violet-400' : 'text-emerald-400'}`} />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/dashboard" className="block">
                <Button
                  variant={plan.highlighted ? 'glow' : 'outline'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-white/30 mt-8"
        >
          All plans include SSL security, 99.9% uptime SLA, and automatic updates. Cancel anytime.
        </motion.p>
      </div>
    </section>
  )
}
