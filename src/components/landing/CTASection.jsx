import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import DashboardCanvas from '@/components/three/DashboardCanvas'

export default function CTASection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border border-violet-500/20 bg-gradient-to-b from-violet-900/30 to-purple-900/20 p-12 md:p-16 text-center"
        >
          {/* 3D background */}
          <div className="absolute inset-0 opacity-30">
            <Suspense fallback={null}>
              <DashboardCanvas />
            </Suspense>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/80" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-900/50">
              <Brain size={28} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Ready to <span className="gradient-text">boost sales?</span>
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
              Join 2,400+ Shopify stores using AI to recommend the right product at the right time. Start your free 14-day trial now.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button variant="glow" size="xl" className="group text-base font-semibold">
                  Start Free Trial
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="glass" size="xl" className="text-base font-semibold">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-white/30 mt-4">No credit card required · Cancel anytime · Setup in 5 minutes</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
