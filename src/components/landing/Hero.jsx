import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import HeroCanvas from '@/components/three/HeroCanvas'

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-20 pb-32 px-6 overflow-hidden flex items-center" id="hero">
      {/* Background 3D */}
      <div className="absolute inset-0 -z-10">
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-b from-violet-950/20 to-background" />}>
          <HeroCanvas />
        </Suspense>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 -z-20 grid-bg opacity-40" />

      <div className="max-w-5xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Badge className="mx-auto mb-6">
              <Sparkles size={13} />
              AI-Powered Recommendations
            </Badge>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight font-syne">
            Boost Your Business
            <br />
            <span className="gradient-text">Sales with AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Personalized product recommendations powered by machine learning. Increase AOV by 40%, conversions by 2.5x. Works with any store.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/dashboard">
              <Button size="xl" className="group text-base">
                Start Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="text-base">
              Watch Demo (2 min)
            </Button>
          </div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-white/40 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Setup in 5 minutes
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              14-day free trial
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
