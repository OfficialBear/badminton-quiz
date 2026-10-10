import { Link } from 'react-router-dom'
import { ChartIcon } from '@/components/icons'
import { Button, EmptyState, Surface } from '@/components/ui'
import { useI18n } from '@/i18n/I18nContext'
import { modeLabelKey } from '@/data/modes'
import { ROUTES, resultsPath } from '@/router/paths'
import { loadAttempts } from '@/services/storageService'

export function HistoryPage() {
  const { t, language } = useI18n()
  const attempts = loadAttempts()

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
      <h1 className="text-[length:var(--font-size-h1)] font-bold tracking-tight">
        {t('history.title')}
      </h1>

      {attempts.length === 0 ? (
        <Surface padded={false}>
          <EmptyState
            icon={<ChartIcon size={22} />}
            title={t('history.empty.title')}
            description={t('history.empty.body')}
            action={
              <Link to={ROUTES.practice}>
                <Button>{t('practice.start')}</Button>
              </Link>
            }
          />
        </Surface>
      ) : (
        <ul className="border-border bg-card divide-border divide-y overflow-hidden rounded-xl border">
          {attempts.map((attempt) => (
            <li key={attempt.id}>
              <Link
                to={resultsPath(attempt.id)}
                className="text-foreground hover:bg-secondary flex min-h-16 items-center justify-between gap-4 px-4 py-3 no-underline hover:no-underline"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-semibold">{t(modeLabelKey(attempt.config.mode))}</span>
                  <span className="text-muted-foreground text-sm">
                    {new Date(attempt.startedAt).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}
                    {' · '}
                    {attempt.totalQuestions} {t('history.questions')}
                  </span>
                </span>
                <span className="font-bold whitespace-nowrap tabular-nums">
                  {attempt.status === 'submitted' && attempt.scorePercentage !== null
                    ? `${attempt.scorePercentage}%`
                    : t('history.inProgress')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
