import type { ComponentProps, ReactNode } from 'react'
import { Button as ShadcnButton } from '@/components/shadcn/button'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

type ShadcnButtonProps = ComponentProps<typeof ShadcnButton>

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children?: ReactNode
}

const VARIANTS: Record<ButtonVariant, ShadcnButtonProps['variant']> = {
  primary: 'default',
  accent: 'default',
  secondary: 'outline',
  ghost: 'ghost',
  danger: 'destructive',
}

const SIZES: Record<ButtonSize, ShadcnButtonProps['size']> = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  ...rest
}: ButtonProps) {
  return (
    <ShadcnButton
      variant={VARIANTS[variant]}
      size={SIZES[size]}
      className={cn(
        fullWidth && 'w-full',
        variant === 'accent' &&
          'bg-[var(--color-accent)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-hover)]',
        className,
      )}
      {...rest}
    />
  )
}
