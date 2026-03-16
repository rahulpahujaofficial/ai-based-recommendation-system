import { cn } from '@/lib/utils'

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg',
        'text-white placeholder-white/30 text-sm',
        'focus:outline-none focus:border-violet-500 focus:bg-white/8 focus:ring-1 focus:ring-violet-500/20',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}
