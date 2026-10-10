import { Progress } from '@/components/shadcn/progress'
import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  value: number
  max?: number
  tone?: 'primary' | 'accent' | 'success'
  label?: string
  className?: string
}

const TONES: Record<string, string> = {
  primary: '',
  accent: '[&_[data-slot=progress-indicator]]:bg-[var(--color-accent)]',
  success: '[&_[data-slot=progress-indicator]]:bg-[var(--color-success)]',
}

export function ProgressBar({ value, max = 100, tone = 'primary', label, className }: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100
  const clamped = Math.min(Math.max(value, 0), safeMax)
  const percent = (clamped / safeMax) * 100
  return (
    <Progress value={percent} aria-label={label} className={cn('h-2', TONES[tone], className)} />
  )
}
