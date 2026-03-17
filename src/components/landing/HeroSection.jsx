import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Star, CheckCircle2, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import HeroCanvas from '@/components/three/HeroCanvas'

const floatingBadges = [
  { label: '+43% Revenue', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', x: 'left-4 md:left-12', y: 'top-1/3' },
  { label: 'AI Trained', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30', x: 'right-4 md:right-12', y: 'top-1/4' },
  { label: '2.8s Setup', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', x: 'right-6 md:right-20', y: 'bottom-1/3' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <HeroCanvas />
        </Suspense>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-background/20 to-background" />
      <div className="absolute inset-0 z-1 bg-gradient-radial from-violet-900/20 via-transparent to-transparent" style={{ background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.2) 0%, transparent 70%)' }} />

      {/* Floating UI badges */}
      {floatingBadges.map((badge, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 + i * 0.2, duration: 0.5 }}
          className={`absolute z-20 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.color} ${badge.x} ${badge.y} backdrop-blur-sm`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {badge.label}
        </motion.div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-6">
            <Zap size={14} className="text-violet-400" />
            <span>AI-Powered • Business Ready • Zero Code</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6"
        >
          Recommendations
          <br />
          That <span className="gradient-text">Actually Sell</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The AI recommendation engine built for online stores. Analyze user behavior, surface the right products, and boost average order value — embedded in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Link to="/dashboard">
            <Button variant="glow" size="xl" className="w-full sm:w-auto text-base font-semibold group">
              Start For Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="glass" size="xl" className="w-full sm:w-auto text-base font-semibold">
            <Play size={16} className="text-violet-400" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
            ))}
            <span className="text-sm text-white/50 ml-2">4.9/5 from 2,400+ stores</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/20" />
          <div className="flex items-center gap-4">
            {['No credit card', 'Setup in 5 min', 'GDPR compliant'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-white/40">
                <CheckCircle2 size={12} className="text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}
