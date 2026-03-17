import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  if (
    location.pathname.startsWith('/dashboard') ||
    location.pathname === '/login' ||
    location.pathname === '/register'
  ) return null

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Docs', href: '#' },
    { label: 'Blog', href: '#' },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white font-syne">
              Reco<span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="text-sm"><ArrowRight size={14} /> Get Started</Button>
            </Link>
          </div>

          <button className="md:hidden text-white/50 hover:text-white transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-white/8 bg-background">
              <div className="px-6 py-4 space-y-3">
                {navLinks.map((link) => (
                  <a key={link.label} href={link.href} className="block text-sm text-white/60 hover:text-white transition-colors duration-200">
                    {link.label}
                  </a>
                ))}
                <div className="pt-3 border-t border-white/8 space-y-2">
                  <Link to="/login" className="block">
                    <Button variant="outline" size="sm" className="w-full text-sm">Sign In</Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button size="sm" className="w-full text-sm"><ArrowRight size={14} /> Get Started</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="h-16" />
    </>
  )
}
