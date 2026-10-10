import { useI18n } from '@/i18n/I18nContext'
import { APP_VERSION } from '@/config'

export function AppFooter() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-[var(--color-divider)] py-5">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-1 px-4 md:px-6">
        <p className="text-sm text-muted-foreground">{t('footer.disclaimer')}</p>
        <p className="text-xs text-[var(--color-text-subtle)]">
          {t('settings.version')}: {APP_VERSION}
        </p>
      </div>
    </footer>
  )
}
