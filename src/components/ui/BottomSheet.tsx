import type { ReactNode } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/shadcn/sheet'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  closeLabel: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: BottomSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <SheetContent side="bottom" className={className}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? <div className="mt-4">{footer}</div> : null}
      </SheetContent>
    </Sheet>
  )
}
