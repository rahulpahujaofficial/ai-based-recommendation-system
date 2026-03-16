import { motion } from 'framer-motion'
import { Upload, Brain, Code2, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Import Your Products',
    description: 'Connect your Shopify store or upload your product catalog via CSV. Our system ingests everything — titles, descriptions, images, tags, and prices.',
    highlight: 'Supports Shopify, WooCommerce, CSV',
    color: 'violet',
  },
  {
    icon: Brain,
    number: '02',
    title: 'AI Trains On Your Catalog',
    description: 'Our ML models analyze product relationships, user behavior patterns, and purchase sequences to build your personalized recommendation graph.',
    highlight: 'Ready in under 60 seconds',
    color: 'cyan',
  },
  {
    icon: Code2,
    number: '03',
    title: 'Generate Your Embed Widget',
    description: 'One click to generate a custom embed URL and JavaScript snippet. Paste it anywhere in your Shopify theme — product pages, cart, homepage, checkout.',
    highlight: '2 lines of code to embed',
    color: 'pink',
  },
  {
    icon: TrendingUp,
    number: '04',
    title: 'Watch Revenue Grow',
    description: 'Real-time analytics show you which recommendations drive clicks, add-to-carts, and purchases. Revenue attribution tracked automatically.',
    highlight: 'Avg. +38% order value increase',
    color: 'amber',
  },
]

const colorMap = {
  violet: { bg: 'bg-violet-500/15', gradient: 'from-violet-500 to-purple-600', border: 'border-violet-500/30', text: 'text-violet-400', line: 'bg-violet-500/40' },
  cyan: { bg: 'bg-cyan-500/15', gradient: 'from-cyan-500 to-blue-600', border: 'border-cyan-500/30', text: 'text-cyan-400', line: 'bg-cyan-500/40' },
  pink: { bg: 'bg-pink-500/15', gradient: 'from-pink-500 to-rose-600', border: 'border-pink-500/30', text: 'text-pink-400', line: 'bg-pink-500/40' },
  amber: { bg: 'bg-amber-500/15', gradient: 'from-amber-500 to-orange-600', border: 'border-amber-500/30', text: 'text-amber-400', line: 'bg-amber-500/40' },
}

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-30" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-sm font-medium mb-4">
            Simple 4-Step Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            From zero to <span className="gradient-text">AI-powered</span> in minutes
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            No developer needed. No complex setup. Just connect, generate, and embed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon
            const colors = colorMap[step.color]
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative z-10"
              >
                <div className="glass-card rounded-2xl p-6 h-full hover:border-white/15 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`${colors.text} w-5 h-5`} />
                    </div>
                    <span className={`text-3xl font-bold ${colors.text} opacity-30`}>{step.number}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">{step.description}</p>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                    <CheckCircle2 size={11} />
                    {step.highlight}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-16 -right-3 z-20 items-center justify-center w-6 h-6">
                    <ArrowRight size={14} className="text-white/30" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
