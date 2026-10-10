import type { ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OptionRowState = 'idle' | 'correct' | 'wrong' | 'muted'

export interface OptionRowProps {
  name: string
  type: 'radio' | 'checkbox'
  optionId: string
  marker: string
  checked: boolean
  state?: OptionRowState
  disabled?: boolean
  onSelect: () => void
  children: ReactNode
}

export function OptionRow({
  name,
  type,
  optionId,
  marker,
  checked,
  state = 'idle',
  disabled = false,
  onSelect,
  children,
}: OptionRowProps) {
  return (
    <label
      className={cn(
        'border-border bg-card relative flex w-full cursor-pointer items-start gap-3 rounded-lg border-[1.5px] p-4 transition-colors',
        'hover:bg-secondary',
        checked && 'border-primary bg-[var(--color-primary-soft)]',
        state === 'correct' &&
          'border-[var(--color-success-border)] bg-[var(--color-success-bg)]',
        state === 'wrong' && 'border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]',
        disabled && 'cursor-not-allowed',
      )}
    >
      <input
        type={type}
        name={name}
        value={optionId}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="absolute size-px opacity-0"
      />
      <span
        aria-hidden="true"
        className={cn(
          'border-border-strong bg-card text-muted-foreground grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] text-sm font-semibold',
          'border-[var(--color-border-strong)]',
          type === 'checkbox' && 'rounded-md',
          checked && 'border-primary bg-primary text-primary-foreground',
          state === 'correct' && 'border-[var(--color-success)] bg-[var(--color-success)] text-[var(--color-success-bg)]',
          state === 'wrong' && 'border-[var(--color-danger)] bg-[var(--color-danger)] text-[var(--color-danger-bg)]',
        )}
      >
        {marker}
      </span>
      <span className="min-w-0 flex-1 pt-0.5 text-base leading-normal">{children}</span>
      {state === 'correct' || state === 'wrong' ? (
        <span
          aria-hidden="true"
          className={cn(
            'grid size-6 shrink-0 place-items-center',
            state === 'correct' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
          )}
        >
          {state === 'correct' ? <Check size={18} /> : <X size={18} />}
        </span>
      ) : null}
    </label>
  )
}
