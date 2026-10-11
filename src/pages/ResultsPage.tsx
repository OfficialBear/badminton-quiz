import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Badge,
  Button,
  EmptyState,
  ProgressBar,
  ProgressRing,
  SectionHeader,
  StatTile,
  Surface,
  Tabs,
} from '@/components/ui'
import { ChartIcon, CheckIcon, CloseIcon, MinusIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nContext'
import type { MessageKey } from '@/i18n'
import { QUESTION_BANK } from '@/data/questionBank'
import { categoryLabelKey, difficultyLabelKey, questionTypeLabelKey } from '@/data/categories'
import { modeLabelKey } from '@/data/modes'
import { ROUTES, practicePath } from '@/router/paths'
import { gradeFor } from '@/services/scoringService'
import { questionsForAttempt, usesDraftQuestions } from '@/services/quizService'
import { loadAttempts } from '@/services/storageService'
import type { GradeId } from '@/services/scoringService'
import { cn } from '@/lib/utils'

const GRADE_KEYS: Record<GradeId, MessageKey> = {
  excellent: 'grade.excellent',
  good: 'grade.good',
  pass: 'grade.pass',
  'needs-improvement': 'grade.needsImprovement',
}

const GRADE_DESC_KEYS: Record<GradeId, MessageKey> = {
  excellent: 'grade.excellent.desc',
  good: 'grade.good.desc',
  pass: 'grade.pass.desc',
  'needs-improvement': 'grade.needsImprovement.desc',
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

export function ResultsPage() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const { attemptId } = useParams<{ attemptId: string }>()
  const [tab, setTab] = useState('overview')

  const attempt = attemptId
    ? loadAttempts().find((item) => item.id === attemptId && item.status === 'submitted')
    : undefined

  if (!attempt) {
    return (
      <EmptyState
        icon={<ChartIcon size={22} />}
        title={t('results.notFound.title')}
        description={t('results.notFound.body')}
        action={<Button onClick={() => navigate(ROUTES.home)}>{t('results.backHome')}</Button>}
      />
    )
  }

  const questions = questionsForAttempt(attempt, QUESTION_BANK)
  const percentage = Math.round(attempt.scorePercentage ?? 0)
  const grade = gradeFor(attempt.scorePercentage ?? 0)
  const wrongQuestions = questions.filter((question) => {
    const selected = attempt.answers[question.id]?.selectedOptionIds ?? []
    if (selected.length === 0) return true
    const set = [...selected].sort()
    const correct = [...question.correctOptionIds].sort()
    return !(set.length === correct.length && set.every((id, i) => id === correct[i]))
  })
  const detailQuestions = tab === 'wrong' ? wrongQuestions : questions

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-[length:var(--font-size-h1)] font-bold tracking-tight">
          {t('results.title')}
        </h1>
        <p className="text-muted-foreground">
          {t(modeLabelKey(attempt.config.mode))} ·{' '}
          {new Date(attempt.startedAt).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}
        </p>
      </div>

      {usesDraftQuestions(questions) ? (
        <p className="text-sm text-[var(--color-warning)]">{t('quiz.draftNotice')}</p>
      ) : null}

      <Surface className="flex flex-wrap items-center gap-6">
        <ProgressRing
          value={percentage}
          label={`${percentage}%`}
          sublabel={t(GRADE_KEYS[grade])}
          ariaLabel={t('results.accuracy')}
        />
        <div className="flex min-w-[220px] flex-1 flex-col gap-1">
          <p className="text-[length:var(--font-size-h2)] font-bold">{t(GRADE_KEYS[grade])}</p>
          <p className="text-muted-foreground mb-3">{t(GRADE_DESC_KEYS[grade])}</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label={t('results.correct')} value={attempt.correctCount ?? 0} tone="success" />
            <StatTile label={t('results.wrong')} value={attempt.wrongCount ?? 0} tone="danger" />
            <StatTile label={t('results.unanswered')} value={attempt.unansweredCount ?? 0} tone="muted" />
            <StatTile label={t('results.timeSpent')} value={formatDuration(attempt.elapsedSeconds)} />
          </div>
        </div>
      </Surface>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => navigate(ROUTES.practice)}>
          {t('results.retry')}
        </Button>
        <Button onClick={() => navigate(ROUTES.review)}>{t('results.goReview')}</Button>
        <Button variant="secondary" onClick={() => navigate(practicePath({ mode: 'topic' }))}>
          {t('mode.topic')}
        </Button>
        <Button variant="ghost" onClick={() => navigate(ROUTES.home)}>
          {t('results.backHome')}
        </Button>
      </div>

      <Tabs
        ariaLabel={t('results.title')}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: t('results.tab.overview') },
          { id: 'detail', label: t('results.tab.detail') },
          { id: 'wrong', label: t('results.tab.wrong'), badge: wrongQuestions.length },
        ]}
      />

      {tab === 'overview' ? (
        <Surface>
          <SectionHeader title={t('results.categoryBreakdown')} />
          <div className="mt-4 flex flex-col gap-3">
            {attempt.categoryStats.map((stat) => (
              <div
                key={stat.category}
                className="grid gap-1 sm:grid-cols-[180px_1fr_56px] sm:items-center sm:gap-3"
              >
                <span className="text-sm">{t(categoryLabelKey(stat.category))}</span>
                <div className="min-w-0">
                  {stat.accuracy !== null ? (
                    <ProgressBar
                      value={stat.accuracy}
                      tone="success"
                      label={t(categoryLabelKey(stat.category))}
                    />
                  ) : null}
                </div>
                <span className="text-right font-semibold tabular-nums">
                  {stat.accuracy !== null ? `${Math.round(stat.accuracy)}%` : t('results.noData')}
                </span>
              </div>
            ))}
          </div>
        </Surface>
      ) : detailQuestions.length === 0 ? (
        <EmptyState icon={<CheckIcon size={22} />} title={t('review.empty.title')} />
      ) : (
        <ul className="flex flex-col gap-3">
          {detailQuestions.map((question, questionIndex) => {
            const selected = attempt.answers[question.id]?.selectedOptionIds ?? []
            const correctSet = [...question.correctOptionIds].sort()
            const selectedSet = [...selected].sort()
            const isRight =
              selectedSet.length === correctSet.length &&
              selectedSet.every((id, i) => id === correctSet[i])
            return (
              <li key={question.id}>
                <Surface className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold tabular-nums text-[var(--color-text-subtle)]">
                      {String(questionIndex + 1).padStart(2, '0')}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="info">{t(questionTypeLabelKey(question.type))}</Badge>
                      <Badge variant="neutral">{t(difficultyLabelKey(question.difficulty))}</Badge>
                      <Badge variant="neutral">{t(categoryLabelKey(question.category))}</Badge>
                      {selected.length === 0 ? (
                        <Badge variant="warning">
                          <MinusIcon size={14} />
                          {t('results.notAnswered')}
                        </Badge>
                      ) : (
                        <Badge variant={isRight ? 'success' : 'danger'}>
                          {isRight ? <CheckIcon size={14} /> : <CloseIcon size={14} />}
                          {isRight ? t('results.correct') : t('results.wrong')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="font-medium leading-relaxed">{question.question[language]}</p>
                  <ul className="flex flex-col gap-2">
                    {question.options.map((option) => {
                      const isCorrect = question.correctOptionIds.includes(option.id)
                      const isChosen = selected.includes(option.id)
                      return (
                        <li
                          key={option.id}
                          className={cn(
                            'border-border flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm',
                            isCorrect &&
                              'border-[var(--color-success-border)] bg-[var(--color-success-bg)]',
                            isChosen &&
                              !isCorrect &&
                              'border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]',
                          )}
                        >
                          {option.text[language]}
                          {isCorrect ? (
                            <span className="text-muted-foreground flex-none text-xs">
                              {t('results.correctAnswer')}
                            </span>
                          ) : null}
                          {isChosen ? (
                            <span className="text-muted-foreground flex-none text-xs">
                              {t('results.yourAnswer')}
                            </span>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                  <p className="text-muted-foreground leading-relaxed">
                    {question.explanation[language]}
                  </p>
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    {t('results.ruleReference')}: {question.ruleReference} ·{' '}
                    {t('results.ruleVersion')}: {question.ruleVersion}
                  </p>
                </Surface>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
