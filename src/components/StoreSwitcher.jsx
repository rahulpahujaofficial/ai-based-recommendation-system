import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus, Store, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/context/StoreContext'
import { storesApi } from '@/lib/api'

export default function StoreSwitcher() {
  const navigate = useNavigate()
  const { storeId, stores = [], switchStore } = useStore()
  const [open, setOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreDomain, setNewStoreDomain] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setShowCreateForm(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const currentStore = stores.find(s => s.store_id === storeId)

  const handleSwitchStore = (store) => {
    switchStore(store.store_id)
    setOpen(false)
  }

  const handleCreateStore = async (e) => {
    e.preventDefault()
    if (!newStoreName.trim()) {
      setError('Store name is required')
      return
    }

    setCreating(true)
    setError('')

    try {
      const newStore = await storesApi.create({
        name: newStoreName,
        domain: newStoreDomain || undefined
      })
      setNewStoreName('')
      setNewStoreDomain('')
      setShowCreateForm(false)
      switchStore(newStore.store_id)
      setOpen(false)
    } catch (err) {
      setError(err.message || 'Failed to create store')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 transition-colors text-left"
      >
        <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0">
          <Store size={12} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">{currentStore?.name || 'Select Store'}</p>
          {currentStore?.domain && <p className="text-[10px] text-white/40 truncate">{currentStore.domain}</p>}
        </div>
        <ChevronDown size={14} className={`text-white/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto">
              {stores.length > 0 ? (
                stores.map(store => (
                  <button
                    key={store.store_id}
                    onClick={() => handleSwitchStore(store)}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                  >
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0">
                      <Store size={10} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{store.name}</p>
                      {store.domain && <p className="text-[10px] text-white/40 truncate">{store.domain}</p>}
                    </div>
                    {store.store_id === storeId && <Check size={14} className="text-violet-400 shrink-0" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-white/40">No stores yet</div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-white/10 bg-gray-900/50">
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded text-xs text-violet-400 hover:text-violet-300 hover:bg-white/5 transition-colors"
                >
                  <Plus size={12} /> Create Store
                </button>
              ) : (
                <form onSubmit={handleCreateStore} className="space-y-2">
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <Input
                    type="text"
                    placeholder="Store name"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="text-xs h-8"
                    disabled={creating}
                  />
                  <Input
                    type="text"
                    placeholder="Domain (optional)"
                    value={newStoreDomain}
                    onChange={(e) => setNewStoreDomain(e.target.value)}
                    className="text-xs h-8"
                    disabled={creating}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="flex-1 text-xs h-7"
                      disabled={creating}
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-7"
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewStoreName('')
                        setNewStoreDomain('')
                        setError('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
