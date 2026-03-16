import { cn } from '@/lib/utils'

const buttonVariants = {
  glow: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-600/50 hover:shadow-violet-600/70 border border-violet-400/20',
  outline: 'border border-white/20 hover:border-white/40 bg-transparent text-white hover:bg-white/5',
  glass: 'glass-card text-white/70 hover:text-white hover:bg-white/10 border border-white/10',
  ghost: 'hover:bg-white/10 text-white/70 hover:text-white',
  destructive: 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/20',
  success: 'bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/20',
}

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3 text-base',
  xl: 'px-6 py-3.5 text-lg',
  icon: 'p-2',
}

export function Button({
  children,
  variant = 'glow',
  size = 'md',
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 whitespace-nowrap',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants[variant] || buttonVariants.glow,
        sizes[size] || sizes.md,
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
