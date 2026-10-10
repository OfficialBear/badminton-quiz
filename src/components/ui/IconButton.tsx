import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/shadcn/button'

export interface IconButtonProps extends Omit<ComponentProps<typeof Button>, 'size' | 'variant'> {
  label: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'solid' | 'outline'
  children: ReactNode
}

const SIZES = { sm: 'icon-sm', md: 'icon', lg: 'icon-lg' } as const
const VARIANTS = { ghost: 'ghost', solid: 'secondary', outline: 'outline' } as const

export function IconButton({
  label,
  size = 'md',
  variant = 'ghost',
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      size={SIZES[size]}
      variant={VARIANTS[variant]}
      aria-label={label}
      title={label}
      className={className}
      {...rest}
    >
      {children}
    </Button>
  )
}
