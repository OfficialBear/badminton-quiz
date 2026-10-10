import { Link, useNavigate } from 'react-router-dom'
import { BookIcon, FlagIcon, PlayIcon, TargetIcon } from '@/components/icons'
import type { IconProps } from '@/components/icons'
import { Alert, EmptyState, SectionHeader, StatTile, Surface } from '@/components/ui'
import { Button } from '@/components/shadcn/button'
import { useI18n } from '@/i18n/I18nContext'
import { MODES, modeLabelKey } from '@/data/modes'
import { ROUTES, practicePath, quizPath } from '@/router/paths'
import { DEFAULT_CONFIG, createAttempt, createAttemptFromQuestions } from '@/services/quizService'
import { QUESTION_BANK } from '@/data/questionBank'
import {
  loadActiveAttempt,
  loadAttempts,
  loadReview,
  saveActiveAttempt,
  saveAttempt,
} from '@/services/storageService'
import type { QuizMode } from '@/types/attempt'

const MODE_ICONS: Record<string, (props: IconProps) => React.ReactNode> = {
  practice: PlayIcon,
  exam: BookIcon,
  topic: TargetIcon,
  wrong: FlagIcon,
}

export function HomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const attempts = loadAttempts()
  const inProgress = loadActiveAttempt()
  const review = loadReview()
  const reviewCount = Object.values(review).filter((item) => !item.mastered).length
  const recent = attempts.slice(0, 3)

  const submitted = attempts.filter((attempt) => attempt.status === 'submitted')
  const answeredTotal = attempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0)
  const accuracy =
    submitted.length > 0
      ? Math.round(
          submitted.reduce((sum, attempt) => sum + (attempt.scorePercentage ?? 0), 0) /
            submitted.length,
        )
      : 0

  const startQuick = () => {
    const attempt = createAttempt(DEFAULT_CONFIG, QUESTION_BANK)
    if (!attempt) {
      navigate(ROUTES.practice)
      return
    }
    saveAttempt(attempt)
    saveActiveAttempt(attempt)
    navigate(quizPath(attempt.id))
  }

  const buildWrongAttempt = () => {
    const wrongIds = new Set(
      Object.values(review)
        .filter((item) => !item.mastered)
        .map((item) => item.questionId),
    )
    const questions = QUESTION_BANK.filter((question) => wrongIds.has(question.id))
    return createAttemptFromQuestions(
      { ...DEFAULT_CONFIG, mode: 'wrong', questionCount: 'all', randomizeQuestions: false },
      questions,
    )
  }

  const startMode = (mode: QuizMode) => {
    if (mode === 'topic') {
      navigate(practicePath({ mode: 'topic' }))
      return
    }
    const attempt =
      mode === 'wrong'
        ? buildWrongAttempt()
        : createAttempt({ ...DEFAULT_CONFIG, mode }, QUESTION_BANK)
    if (!attempt) {
      navigate(mode === 'wrong' ? ROUTES.review : ROUTES.practice)
      return
    }
    saveAttempt(attempt)
    saveActiveAttempt(attempt)
    navigate(quizPath(attempt.id))
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3 pt-4">
        <h1 className="max-w-[20ch] text-[length:var(--font-size-display)] font-bold tracking-tight">
          {t('home.title')}
        </h1>
        <p className="max-w-[64ch] text-[length:var(--font-size-body-lg)] leading-relaxed text-muted-foreground">
          {t('home.subtitle')}
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={startQuick}
            className="gap-2 bg-[var(--color-accent)] px-5 font-semibold text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-hover)]"
          >
            <PlayIcon />
            {t('home.quickStart')}
          </Button>
        </div>
      </section>

      {inProgress ? (
        <Surface className="border-[var(--color-primary)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{t('home.resume.title')}</span>
            <span className="text-muted-foreground text-sm">
              {t(modeLabelKey(inProgress.config.mode))} ·{' '}
              {t('quiz.question', { current: 1, total: inProgress.totalQuestions })}
            </span>
          </div>
          <Button onClick={() => navigate(quizPath(inProgress.id))}>{t('common.continue')}</Button>
        </Surface>
      ) : null}

      <section className="flex flex-col gap-4">
        <SectionHeader title={t('home.moreModes')} />
        <div className="grid gap-3 md:grid-cols-3">
          {MODES.filter((mode) => mode.id !== 'practice').map((mode) => {
            const Icon = MODE_ICONS[mode.id] ?? PlayIcon
            return (
              <Button
                key={mode.id}
                type="button"
                variant="outline"
                onClick={() => startMode(mode.id)}
                className="h-auto w-full items-start justify-start gap-3 rounded-lg p-4 text-left whitespace-normal"
              >
                <span
                  className="bg-[var(--color-primary-soft)] text-primary grid size-10 shrink-0 place-items-center rounded-md"
                  aria-hidden="true"
                >
                  <Icon />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-semibold">{t(mode.titleKey)}</span>
                  <span className="text-muted-foreground text-sm leading-normal">
                    {t(mode.descKey)}
                  </span>
                </span>
              </Button>
            )
          })}
        </div>
      </section>

      {attempts.length === 0 ? (
        <Surface padded={false}>
          <EmptyState
            icon={<BookIcon size={22} />}
            title={t('history.empty.title')}
            description={t('history.empty.body')}
          />
        </Surface>
      ) : (
        <>
          <section className="flex flex-col gap-4">
            <SectionHeader title={t('home.stats.title')} />
            <Surface className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <StatTile label={t('home.stats.attempts')} value={attempts.length} />
              <StatTile label={t('home.stats.answered')} value={answeredTotal} />
              <StatTile label={t('home.stats.accuracy')} value={`${accuracy}%`} tone="success" />
              <StatTile
                label={t('home.review.count')}
                value={reviewCount}
                tone={reviewCount > 0 ? 'warning' : 'default'}
              />
            </Surface>
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeader
              title={t('home.recent.title')}
              actions={<Link to={ROUTES.history}>{t('home.recent.viewAll')}</Link>}
            />
            <ul className="border-border bg-card divide-border divide-y overflow-hidden rounded-xl border">
              {recent.map((attempt) => (
                <li key={attempt.id}>
                  <Link
                    to={`/results/${attempt.id}`}
                    className="text-foreground hover:bg-secondary grid min-h-11 grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 no-underline hover:no-underline"
                  >
                    <span className="font-medium">{t(modeLabelKey(attempt.config.mode))}</span>
                    <span className="text-muted-foreground text-sm">
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {attempt.scorePercentage !== null ? `${attempt.scorePercentage}%` : '—'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {QUESTION_BANK.some((question) => question.reviewStatus !== 'verified') ? (
        <Alert variant="warning" title={t('home.draftNotice')} />
      ) : null}
    </div>
  )
}
