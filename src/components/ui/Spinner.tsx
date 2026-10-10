import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const SIZES = { sm: 16, md: 24, lg: 36 } as const

export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      size={SIZES[size]}
      className={cn('animate-spin text-muted-foreground', className)}
    />
  )
}
