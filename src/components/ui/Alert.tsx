import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type AlertVariant = 'success' | 'danger' | 'warning' | 'info'

export interface AlertProps {
  variant: AlertVariant
  title?: ReactNode
  className?: string
  children?: ReactNode
}

const VARIANTS: Record<AlertVariant, string> = {
  success:
    'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]',
  danger:
    'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-border)]',
  warning:
    'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info-border)]',
}

export function Alert({ variant, title, className, children }: AlertProps) {
  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={cn('flex flex-col gap-1 rounded-lg border-l-4 border-y border-r px-4 py-3', VARIANTS[variant], className)}
    >
      {title ? <div className="font-semibold">{title}</div> : null}
      {children ? <div className="text-sm leading-relaxed">{children}</div> : null}
    </div>
  )
}
