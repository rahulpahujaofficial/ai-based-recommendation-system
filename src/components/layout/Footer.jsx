import { Link } from 'react-router-dom'
import { Brain, Twitter, Github, Linkedin, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocation } from 'react-router-dom'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
    { label: 'Roadmap', href: '#' },
  ],
  Developers: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Widget Builder', href: '#' },
    { label: 'SDKs', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
}

export default function Footer() {
  const location = useLocation()
  if (location.pathname.startsWith('/dashboard')) return null

  return (
    <footer className="border-t border-white/8 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl text-white font-syne">Reco<span className="gradient-text">AI</span></span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-xs">
              AI-powered product recommendations that boost Shopify store revenue. Set up in minutes, results in days.
            </p>
            <div className="flex items-center gap-2">
              <Input placeholder="Enter your email" className="text-sm h-9" />
              <Button variant="glow" size="sm" className="shrink-0 h-9 px-3">
                <ArrowRight size={14} />
              </Button>
            </div>
            <p className="text-xs text-white/30 mt-2">No spam. Unsubscribe anytime.</p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-white/40 hover:text-white/80 transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © 2026 RecoAI. All rights reserved. Made with ♥ for Shopify stores.
          </p>
          <div className="flex items-center gap-3">
            {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-white/40 hover:text-violet-400 hover:border-violet-500/40 transition-all duration-200">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
