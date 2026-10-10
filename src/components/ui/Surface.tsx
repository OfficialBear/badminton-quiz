import { createElement } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SurfaceProps {
  variant?: 'default' | 'sunken' | 'outline'
  padded?: boolean
  className?: string
  children?: ReactNode
}

export function Surface({ variant = 'default', padded = true, className, children }: SurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border',
        variant === 'sunken' && 'bg-[var(--color-surface-sunken)]',
        variant === 'outline' ? 'bg-transparent' : 'bg-card',
        padded && 'p-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export interface SectionHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  as?: 'h2' | 'h3'
  className?: string
}

export function SectionHeader({
  title,
  description,
  actions,
  as = 'h2',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        {createElement(as, { className: 'text-lg font-semibold tracking-tight' }, title)}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
