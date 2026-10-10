import { cn } from '@/lib/utils'

export interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  tone?: 'primary' | 'accent' | 'success'
  label?: string
  sublabel?: string
  ariaLabel?: string
  className?: string
}

const TONES: Record<string, string> = {
  primary: 'stroke-[var(--color-primary)]',
  accent: 'stroke-[var(--color-accent)]',
  success: 'stroke-[var(--color-success)]',
}

export function ProgressRing({
  value,
  size = 132,
  strokeWidth = 12,
  tone = 'accent',
  label,
  sublabel,
  ariaLabel,
  className,
}: ProgressRingProps) {
  const clamped = Math.min(Math.max(value, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - clamped / 100)

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel ?? `${clamped}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={cn('transition-[stroke-dashoffset]', TONES[tone])}
        />
      </svg>
      {label || sublabel ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
          {label ? <span className="text-2xl font-bold leading-none tabular-nums">{label}</span> : null}
          {sublabel ? <span className="text-xs text-muted-foreground">{sublabel}</span> : null}
        </div>
      ) : null}
    </div>
  )
}
