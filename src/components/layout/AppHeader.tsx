import { Link, NavLink } from 'react-router-dom'
import { SettingsIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/I18nContext'
import type { MessageKey } from '@/i18n'
import { ROUTES } from '@/router/paths'

const NAV_ITEMS: { to: string; labelKey: MessageKey }[] = [
  { to: ROUTES.home, labelKey: 'nav.home' },
  { to: ROUTES.practice, labelKey: 'nav.practice' },
  { to: ROUTES.review, labelKey: 'nav.review' },
  { to: ROUTES.history, labelKey: 'nav.history' },
]

export function AppHeader() {
  const { t } = useI18n()
  return (
    <header className="bg-card border-border sticky top-0 z-20 border-b">
      <div className="mx-auto flex min-h-[var(--header-height)] w-full max-w-[1120px] items-center gap-4 px-4 md:px-6">
        <Link
          to={ROUTES.home}
          className="text-foreground inline-flex items-center gap-2 text-[length:var(--font-size-h3)] font-bold tracking-tight no-underline hover:no-underline"
        >
          <span
            className="size-6 rounded-md bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))]"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">{t('app.name')}</span>
        </Link>

        <nav className="hidden gap-1 md:flex" aria-label={t('app.name')}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.home}
              className={({ isActive }) =>
                cn(
                  'text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex min-h-10 items-center rounded-md px-3 font-medium no-underline hover:no-underline',
                  isActive && 'bg-[var(--color-primary-soft)] text-foreground',
                )
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NavLink
            to={ROUTES.settings}
            aria-label={t('nav.settings')}
            title={t('nav.settings')}
            className={({ isActive }) =>
              cn(
                'text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex size-11 items-center justify-center rounded-full no-underline transition-colors',
                isActive &&
                  'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
              )
            }
          >
            <SettingsIcon size={20} />
          </NavLink>
        </div>
      </div>
    </header>
  )
}
