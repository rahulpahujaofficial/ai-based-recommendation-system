import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, LayoutDashboard, Package, Sparkles, Code2, BarChart3,
  Settings, Bell, ChevronDown, LogOut, User, Menu, X,
  Puzzle, HelpCircle, CreditCard, Store
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Package, label: 'Products', href: '/dashboard/products', badge: '8' },
  { icon: Sparkles, label: 'Recommendations', href: '/dashboard/recommendations', badge: 'AI' },
  { icon: Code2, label: 'Embed Widget', href: '/dashboard/embed' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Puzzle, label: 'Integrations', href: '/dashboard/integrations' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

function SidebarItem({ item, collapsed }) {
  const location = useLocation()
  const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
  const Icon = item.icon

  return (
    <Link to={item.href}>
      <div className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
        isActive
          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
      )}>
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-full -ml-0 ml-0" />}
        <Icon size={17} className={cn('shrink-0', isActive ? 'text-violet-400' : '')} />
        {!collapsed && (
          <>
            <span className="text-sm font-medium flex-1">{item.label}</span>
            {item.badge && (
              <Badge variant={item.badge === 'AI' ? 'default' : 'secondary'} className="text-[10px] py-0 px-1.5 h-4">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </div>
    </Link>
  )
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col border-r border-white/8 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}>
        {/* Logo */}
        <div className={cn('h-16 flex items-center border-b border-white/8', collapsed ? 'justify-center px-3' : 'px-5')}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
              <Brain size={15} className="text-white" />
            </div>
            {!collapsed && <span className="font-bold text-base text-white font-syne">Reco<span className="gradient-text">AI</span></span>}
          </Link>
        </div>

        {/* Store selector */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-white/8">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 cursor-pointer hover:bg-white/8 transition-colors">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0">
                <Store size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">My Shopify Store</p>
                <p className="text-[10px] text-white/40">mystore.myshopify.com</p>
              </div>
              <ChevronDown size={12} className="text-white/40 shrink-0" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <SidebarItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Bottom */}
        <div className={cn('border-t border-white/8 p-3 space-y-1', collapsed && 'flex flex-col items-center')}>
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/40">AI Credits</span>
                <span className="text-xs text-violet-400 font-medium">7,234 / 10k</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>
          )}
          <div className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl', !collapsed && 'hover:bg-white/5 transition-colors cursor-pointer')}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center shrink-0">
              <User size={13} className="text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white">Alex Johnson</p>
                <p className="text-[10px] text-white/40">Growth Plan</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 rounded-full glass-card border border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          style={{ position: 'relative', alignSelf: 'flex-end', margin: '0 -8px 8px 0' }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-white/8 z-50 flex flex-col md:hidden"
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Brain size={15} className="text-white" />
                </div>
                <span className="font-bold text-base text-white font-syne">Reco<span className="gradient-text">AI</span></span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <div key={item.href} onClick={() => setMobileOpen(false)}>
                  <SidebarItem item={item} collapsed={false} />
                </div>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/8 bg-background/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-white/50 hover:text-white"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-semibold text-white" id="page-title">Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative w-9 h-9 text-white/50 hover:text-white">
              <Bell size={16} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center cursor-pointer">
              <User size={14} className="text-white" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
