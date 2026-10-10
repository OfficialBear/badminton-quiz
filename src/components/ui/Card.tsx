import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BaseProps {
  className?: string
  children?: ReactNode
}

export function Card({ className, children }: BaseProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card text-card-foreground', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: BaseProps) {
  return (
    <div className={cn('border-b border-border px-5 py-4 font-semibold', className)}>
      {children}
    </div>
  )
}

export function CardBody({ className, children }: BaseProps) {
  return <div className={cn('p-5', className)}>{children}</div>
}

export function CardFooter({ className, children }: BaseProps) {
  return <div className={cn('border-t border-border px-5 py-4', className)}>{children}</div>
}
