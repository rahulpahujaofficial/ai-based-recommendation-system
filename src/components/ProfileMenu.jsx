import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ProfileMenu() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login')
  }

  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm hover:shadow-lg transition-shadow"
      >
        {userInitials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full right-0 mt-2 bg-gray-800 border border-white/10 rounded-lg shadow-lg z-50 min-w-48 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-xs font-medium text-white">{user?.email}</p>
              {user?.full_name && <p className="text-[10px] text-white/40">{user.full_name}</p>}
            </div>

            <div className="py-1">
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => { setOpen(false); navigate('/dashboard/settings') }}
              >
                <Settings size={14} />Settings
              </button>

              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border-t border-white/10"
                onClick={handleLogout}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
