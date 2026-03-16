import { cn } from '@/lib/utils'

const badgeVariants = {
  default: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  destructive: 'bg-red-500/20 text-red-300 border border-red-500/30',
  outline: 'border border-white/20 text-white/70',
  secondary: 'bg-white/10 text-white/70 border border-white/15',
}

export function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
        badgeVariants[variant] || badgeVariants.default,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
