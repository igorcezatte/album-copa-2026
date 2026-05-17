'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  total: number
  color?: string
  height?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

export function ProgressBar({
  value,
  total,
  color = '#f5c42e',
  height = 'sm',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100)
  const h = { xs: 3, sm: 5, md: 8 }[height]

  return (
    <div className={cn('w-full', className)}>
      <div
        className="w-full rounded-full bg-white/5 overflow-hidden"
        style={{ height: h }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
              : `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: pct > 0 ? `0 0 8px ${color}60` : 'none',
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-copa-muted">
          <span>{value}/{total}</span>
          <span>{pct}%</span>
        </div>
      )}
    </div>
  )
}
