import { cn } from '@/lib/utils'

export function Label({ children, className, ...props }) {
  return (
    <label className={cn('block text-sm font-medium text-white', className)} {...props}>
      {children}
    </label>
  )
}
