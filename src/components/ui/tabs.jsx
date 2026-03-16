import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Tabs({ children, defaultValue = null, ...props }) {
  const [activeTab, setActiveTab] = useState(defaultValue)
  return (
    <div {...props}>
      {typeof children === 'function' ? children({ activeTab, setActiveTab }) : children}
    </div>
  )
}

export function TabsList({ children, className, ...props }) {
  return (
    <div className={cn('flex gap-2 border-b border-white/10 mb-6 overflow-x-auto scrollbar-thin pb-0', className)} {...props}>
      {children}
    </div>
  )
}

export function TabsTrigger({ active, onClick, children, className, ...props }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200',
        active
          ? 'border-violet-500 text-white'
          : 'border-transparent text-white/50 hover:text-white/70',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ active = true, children, className, ...props }) {
  if (active === false) return null
  return (
    <div className={cn('mt-6', className)} {...props}>
      {children}
    </div>
  )
}
