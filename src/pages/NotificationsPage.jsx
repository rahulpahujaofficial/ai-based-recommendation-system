import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, ArrowLeft, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/context/StoreContext'
import { notificationsApi } from '@/lib/api'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { storeId } = useStore()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    loadNotifications()
    // Poll every 5 seconds for new notifications
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [storeId])

  const loadNotifications = async () => {
    try {
      const data = await notificationsApi.list(storeId)
      setNotifications(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(storeId, id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await notificationsApi.delete(storeId, id)
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const eventTypeLabels = {
    'weekly_report': 'Weekly Report',
    'model_retrained': 'Model Retrained',
    'low_credit': 'Low Credit',
    'integration_error': 'Integration Error',
    'new_import': 'New Import',
  }

  const eventTypeColors = {
    'weekly_report': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'model_retrained': 'bg-green-500/10 text-green-400 border-green-500/30',
    'low_credit': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    'integration_error': 'bg-red-500/10 text-red-400 border-red-500/30',
    'new_import': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  }

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.event_type === filter)

  const unreadCount = notifications.filter(n => !n.read_at).length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bell size={24} />
                Notifications
              </h1>
              <p className="text-white/40 text-sm mt-1">{unreadCount} unread of {notifications.length} total</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
            }`}
          >
            All
          </button>
          {Object.entries(eventTypeLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === key
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-violet-500 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={32} className="mx-auto text-white/20 mb-3" />
            <p className="text-white/40">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-lg border transition-all ${
                  notif.read_at
                    ? 'bg-white/5 border-white/10'
                    : 'bg-violet-500/10 border-violet-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={`text-[10px] border ${eventTypeColors[notif.event_type] || 'bg-white/10'}`}
                        variant="outline"
                      >
                        {eventTypeLabels[notif.event_type] || notif.event_type}
                      </Badge>
                      {!notif.read_at && (
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1">{notif.subject}</h3>
                    <p className="text-xs text-white/60 mb-2">{notif.body}</p>
                    <p className="text-xs text-white/40">
                      {new Date(notif.sent_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!notif.read_at && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-white/50 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
