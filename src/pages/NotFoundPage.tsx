import { useNavigate } from 'react-router-dom'
import { Button, Surface } from '@/components/ui'
import { useI18n } from '@/i18n/I18nContext'
import { ROUTES } from '@/router/paths'

export function NotFoundPage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[length:var(--font-size-h1)] font-bold tracking-tight">
        {t('common.notFound.title')}
      </h1>
      <Surface>
        <p className="text-sm text-muted-foreground">{t('common.notFound.body')}</p>
      </Surface>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate(ROUTES.home)}>{t('common.goHome')}</Button>
      </div>
    </div>
  )
}
