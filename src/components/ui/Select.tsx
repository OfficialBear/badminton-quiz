import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Field } from './Field'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
}

export function Select({ label, hint, error, options, id, className, ...rest }: SelectProps) {
  const select = (
    <select
      id={id}
      aria-invalid={error ? true : undefined}
      className={cn(
        'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive',
        className,
      )}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )

  if (!label && !hint && !error) return select

  return (
    <Field label={label ?? ''} htmlFor={id} hint={hint} error={error}>
      {select}
    </Field>
  )
}
