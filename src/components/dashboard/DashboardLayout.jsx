import { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, LayoutDashboard, Package, Sparkles, Code2, BarChart3,
  Settings, Bell, User, Menu, X, Puzzle, Store
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useStore } from '@/context/StoreContext'
import StoreSwitcher from '@/components/StoreSwitcher'
import ProfileMenu from '@/components/ProfileMenu'

function SidebarItem({ item, collapsed }) {
  const location = useLocation()
  const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
  const Icon = item.icon
  return (
    <Link to={item.href}>
      <div className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
        isActive ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
      )}>
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-full" />}
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
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { store, productCount, storeId } = useStore()

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Package, label: 'Products', href: '/dashboard/products', badge: productCount > 0 ? String(productCount) : undefined },
    { icon: Sparkles, label: 'Recommendations', href: '/dashboard/recommendations', badge: 'AI' },
    { icon: Code2, label: 'Embed Widget', href: '/dashboard/embed' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Puzzle, label: 'Integrations', href: '/dashboard/integrations' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ]

  const storeName = store?.name || storeId
  const storeDomain = store?.domain || ''

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn('hidden md:flex flex-col border-r border-white/8 transition-all duration-300', collapsed ? 'w-16' : 'w-60')}>
        {/* Logo */}
        <div className={cn('h-16 flex items-center border-b border-white/8', collapsed ? 'justify-center px-3' : 'px-5')}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
              <Brain size={15} className="text-white" />
            </div>
            {!collapsed && <span className="font-bold text-base text-white font-syne">Reco<span className="gradient-text">AI</span></span>}
          </Link>
        </div>

        {/* Store switcher */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-white/8">
            <StoreSwitcher />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => <SidebarItem key={item.href} item={item} collapsed={collapsed} />)}
        </nav>

        {/* Bottom */}
        <div className={cn('border-t border-white/8 p-3 space-y-1', collapsed && 'flex flex-col items-center')}>
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/40">Products</span>
                <span className="text-xs text-violet-400 font-medium">{productCount} catalog</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (productCount / 100) * 100)}%` }} />
              </div>
            </div>
          )}
          <div className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl', !collapsed && 'hover:bg-white/5 transition-colors cursor-pointer')}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center shrink-0">
              <User size={13} className="text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{storeName}</p>
                <p className="text-[10px] text-white/40">Store Owner</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="relative self-end m-2 w-6 h-6 rounded-full glass-card border border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          {collapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-white/8 z-50 flex flex-col md:hidden">
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Brain size={15} className="text-white" />
                </div>
                <span className="font-bold text-base text-white font-syne">Reco<span className="gradient-text">AI</span></span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white"><X size={18} /></button>
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
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/8 bg-background/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-white/50 hover:text-white" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="text-base font-semibold text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative w-9 h-9 text-white/50 hover:text-white"
              onClick={() => navigate('/dashboard/notifications')}
            >
              <Bell size={16} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
            </Button>
            <ProfileMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6"><Outlet /></main>
      </div>
    </div>
  )
}
