import type { InputHTMLAttributes } from 'react'
import { Input as ShadcnInput } from '@/components/shadcn/input'
import { cn } from '@/lib/utils'
import { Field } from './Field'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function Input({ label, hint, error, id, className, ...rest }: InputProps) {
  const input = (
    <ShadcnInput
      id={id}
      aria-invalid={error ? true : undefined}
      className={cn(error && 'border-destructive', className)}
      {...rest}
    />
  )

  if (!label && !hint && !error) return input

  return (
    <Field label={label ?? ''} htmlFor={id} hint={hint} error={error}>
      {input}
    </Field>
  )
}
