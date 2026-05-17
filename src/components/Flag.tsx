'use client'

import { cn } from '@/lib/utils'

interface FlagProps {
  code: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  grayscale?: boolean
}

const sizes = {
  xs: { width: 20, height: 14 },
  sm: { width: 28, height: 20 },
  md: { width: 40, height: 28 },
  lg: { width: 56, height: 40 },
}

export function Flag({ code, size = 'md', className, grayscale = false }: FlagProps) {
  const { width, height } = sizes[size]

  return (
    <span
      className={cn('fi', `fi-${code}`, 'inline-block flex-shrink-0', className)}
      style={{
        width,
        height,
        borderRadius: '0 4px 4px 0',
        filter: grayscale ? 'grayscale(1) brightness(0.4)' : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: grayscale ? 'none' : '0 1px 4px rgba(0,0,0,0.5)',
      }}
    />
  )
}
