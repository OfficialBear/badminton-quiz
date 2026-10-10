import type { ReactNode } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/radio-group'
import { cn } from '@/lib/utils'

export interface RadioOption {
  value: string
  title: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export interface RadioListProps {
  name: string
  value: string
  onChange: (value: string) => void
  options: RadioOption[]
  ariaLabel: string
  className?: string
  columns?: 1 | 2
}

export function RadioList({
  name,
  value,
  onChange,
  options,
  ariaLabel,
  className,
  columns = 1,
}: RadioListProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      aria-label={ariaLabel}
      className={cn('grid gap-2', columns === 2 && 'sm:grid-cols-2', className)}
    >
      {options.map((option) => {
        const id = `${name}-${option.value}`
        const selected = option.value === value
        return (
          <label
            key={option.value}
            htmlFor={id}
            className={cn(
              'border-border bg-card hover:bg-secondary flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors',
              selected && 'border-primary ring-primary ring-1',
              option.disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <RadioGroupItem value={option.value} id={id} disabled={option.disabled} className="mt-0.5" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium">{option.title}</span>
              {option.description ? (
                <span className="text-sm text-muted-foreground">{option.description}</span>
              ) : null}
            </span>
          </label>
        )
      })}
    </RadioGroup>
  )
}
