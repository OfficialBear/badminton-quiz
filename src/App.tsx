import { useEffect } from 'react'
import { I18nProvider } from '@/i18n/I18nProvider'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { AppRouter } from '@/router/AppRouter'
import { Toaster } from '@/components/shadcn/sonner'
import { TooltipProvider } from '@/components/shadcn/tooltip'
import { runMigrations, touchLastOpened } from '@/services/storageService'

export default function App() {
  useEffect(() => {
    runMigrations()
    touchLastOpened()
  }, [])

  return (
    <I18nProvider>
      <ThemeProvider>
        <TooltipProvider delayDuration={200}>
          <AppRouter />
          <Toaster position="top-center" />
        </TooltipProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}
