import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PLANS } from '@/data/mockData'
import { Link } from 'react-router-dom'

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 font-syne">
            Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">Choose the plan that fits your store. Scale as you grow.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className={`h-full ${plan.highlighted ? 'ring-2 ring-violet-500 md:scale-105' : ''} hover:border-white/15 transition-all duration-200`}>
                <CardContent className="p-8">
                  {plan.badge && (
                    <div className="mb-4">
                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">{plan.badge}</Badge>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/50 text-sm mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <span className="text-5xl font-bold text-white">${plan.price}</span>
                    <span className="text-white/50 ml-2">/{plan.period}</span>
                  </div>

                  <Link to="/dashboard" className="block">
                    <Button variant={plan.highlighted ? 'glow' : 'outline'} size="lg" className="w-full mb-8 justify-center">
                      {plan.cta}
                      <ArrowRight size={16} />
                    </Button>
                  </Link>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-white/70">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-16">
          <p className="text-white/50 mb-4">All plans include 14-day free trial. Cancel anytime.</p>
          <Button variant="ghost" className="text-violet-400 hover:text-violet-300">See detailed feature comparison</Button>
        </motion.div>
      </div>
    </section>
  )
}
