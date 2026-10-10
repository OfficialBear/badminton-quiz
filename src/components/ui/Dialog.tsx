import type { ReactNode } from 'react'
import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/dialog'
import { Button } from './Button'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  closeLabel: string
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md'
}

export function Dialog({
  open,
  onClose,
  title,
  closeLabel,
  description,
  children,
  footer,
  size = 'md',
}: DialogProps) {
  return (
    <ShadcnDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className={size === 'sm' ? 'sm:max-w-sm' : undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children ? <div>{children}</div> : null}
        <DialogFooter>
          {footer ?? (
            <Button variant="secondary" onClick={onClose}>
              {closeLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </ShadcnDialog>
  )
}
