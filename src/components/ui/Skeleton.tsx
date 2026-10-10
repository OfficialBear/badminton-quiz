import type { CSSProperties } from 'react'
import { Skeleton as ShadcnSkeleton } from '@/components/shadcn/skeleton'
import { cn } from '@/lib/utils'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  radius?: string
  className?: string
}

export function Skeleton({ width, height = 16, radius, className }: SkeletonProps) {
  const style: CSSProperties = { width, height, borderRadius: radius }
  return <ShadcnSkeleton className={cn(className)} style={style} aria-hidden="true" />
}
