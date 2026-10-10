import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StatTileProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'muted'
  className?: string
}

const TONES: Record<string, string> = {
  default: 'text-foreground',
  success: 'text-[var(--color-success)]',
  danger: 'text-[var(--color-danger)]',
  warning: 'text-[var(--color-warning)]',
  muted: 'text-muted-foreground',
}

export function StatTile({ label, value, hint, tone = 'default', className }: StatTileProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-xl font-bold leading-tight tabular-nums', TONES[tone])}>{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}
