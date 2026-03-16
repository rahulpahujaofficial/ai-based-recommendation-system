import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value = 0, color = "violet", ...props }, ref) => {
  const colors = {
    violet: "bg-gradient-to-r from-violet-500 to-purple-400",
    cyan: "bg-gradient-to-r from-cyan-500 to-blue-400",
    green: "bg-gradient-to-r from-emerald-500 to-green-400",
    amber: "bg-gradient-to-r from-amber-500 to-orange-400",
    pink: "bg-gradient-to-r from-pink-500 to-rose-400",
  }
  return (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/10", className)}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", colors[color])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
