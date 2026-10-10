import type { ReactNode } from 'react'
import { Tabs as ShadcnTabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs'
import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  badge?: ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  value: string
  onChange: (id: string) => void
  ariaLabel: string
  className?: string
}

export function Tabs({ tabs, value, onChange, ariaLabel, className }: TabsProps) {
  return (
    <ShadcnTabs value={value} onValueChange={onChange} className={cn('w-full', className)}>
      <TabsList
        aria-label={ariaLabel}
        className="border-border h-auto w-full justify-start gap-1 rounded-none border-b bg-transparent p-0"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2 rounded-none border-b-2 border-transparent px-3 py-2 text-muted-foreground data-[state=active]:text-foreground"
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge !== null ? (
              <span className="bg-muted text-muted-foreground rounded-full px-1.5 text-xs font-semibold">
                {tab.badge}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
    </ShadcnTabs>
  )
}
