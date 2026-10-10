import { NavLink } from 'react-router-dom'
import { ChartIcon, HomeIcon, PlayIcon, TargetIcon } from '@/components/icons'
import type { IconProps } from '@/components/icons'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/I18nContext'
import type { MessageKey } from '@/i18n'
import { ROUTES } from '@/router/paths'

const ITEMS: { to: string; labelKey: MessageKey; Icon: (props: IconProps) => React.ReactNode }[] = [
  { to: ROUTES.home, labelKey: 'nav.home', Icon: HomeIcon },
  { to: ROUTES.practice, labelKey: 'nav.practice', Icon: PlayIcon },
  { to: ROUTES.review, labelKey: 'nav.review', Icon: TargetIcon },
  { to: ROUTES.history, labelKey: 'nav.history', Icon: ChartIcon },
]

export function AppBottomNav() {
  const { t } = useI18n()
  return (
    <nav
      aria-label={t('app.name')}
      className="bg-card pb-[env(safe-area-inset-bottom)] border-border fixed inset-x-0 bottom-0 z-30 hidden min-h-[var(--bottom-nav-height)] grid-cols-4 border-t max-md:grid"
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === ROUTES.home}
          className={({ isActive }) =>
            cn(
              'text-muted-foreground hover:text-foreground flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 no-underline hover:no-underline',
              isActive && 'text-primary',
            )
          }
        >
          <item.Icon size={22} />
          <span className="text-xs font-medium">{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
