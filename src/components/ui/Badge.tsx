import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'neutral' | 'success' | 'danger' | 'warning' | 'info'

export interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children?: ReactNode
}

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
}

export function Badge({ variant = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold leading-relaxed',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
