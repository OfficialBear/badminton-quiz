import type { ReactNode } from 'react'
import { Checkbox as ShadcnCheckbox } from '@/components/shadcn/checkbox'
import { cn } from '@/lib/utils'

export interface CheckboxProps {
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  disabled?: boolean
  className?: string
}

export function Checkbox({ label, checked, onChange, id, disabled, className }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex min-h-11 cursor-pointer items-center gap-3',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <ShadcnCheckbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onChange(value === true)}
      />
      <span className="text-base">{label}</span>
    </label>
  )
}
