import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface OptionCardProps {
  title: ReactNode
  description?: ReactNode
  selected: boolean
  onSelect: () => void
  disabled?: boolean
  name?: string
  className?: string
}

export function OptionCard({
  title,
  description,
  selected,
  onSelect,
  disabled = false,
  name,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      name={name}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'border-border bg-card hover:bg-secondary relative flex w-full flex-col gap-1 rounded-xl border p-4 text-left transition-colors',
        selected && 'border-primary ring-primary ring-1',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span className="font-semibold">{title}</span>
      {description ? <span className="text-sm text-muted-foreground">{description}</span> : null}
      {selected ? (
        <span
          className="absolute top-3 right-3 size-2.5 rounded-full bg-[var(--color-accent)]"
          aria-hidden="true"
        />
      ) : null}
    </button>
  )
}
