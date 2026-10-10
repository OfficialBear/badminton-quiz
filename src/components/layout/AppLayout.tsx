import { Outlet } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nContext'
import { AppBottomNav } from './AppBottomNav'
import { AppFooter } from './AppFooter'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
      >
        {t('common.skipToContent')}
      </a>
      <AppHeader />
      <main
        id="main-content"
        className="flex-1 pt-6 pb-[calc(var(--bottom-nav-height)+var(--space-6))] md:pb-16"
      >
        <div className="mx-auto w-full max-w-[1120px] px-4 md:px-6">
          <Outlet />
        </div>
      </main>
      <AppFooter />
      <AppBottomNav />
    </div>
  )
}
