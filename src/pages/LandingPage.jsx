import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import CTASection from '@/components/landing/CTASection'

export default function LandingPage() {
  return (
    <div className="bg-background">
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <CTASection />
    </div>
  )
}
