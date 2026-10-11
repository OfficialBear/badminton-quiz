import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Badge,
  Button,
  EmptyState,
  ProgressBar,
  ProgressRing,
  SectionHeader,
  SegmentedControl,
  StatTile,
  Surface,
} from '@/components/ui'
import { CheckIcon, CloseIcon, MinusIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nContext'
import type { MessageKey } from '@/i18n'
import { categoryLabelKey, difficultyLabelKey, questionTypeLabelKey } from '@/data/categories'
import { ROUTES } from '@/router/paths'
import { clearTestState, loadTestState, questionsForTest } from '@/services/officialTestService'
import { cn } from '@/lib/utils'

const GRADE_KEYS: Record<string, MessageKey> = {
  excellent: 'grade.excellent',
  good: 'grade.good',
  pass: 'grade.pass',
  'needs-improvement': 'grade.needsImprovement',
}

type ResultFilter = 'all' | 'correct' | 'wrong'

export function TestResultsPage() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ResultFilter>('all')
  const state = loadTestState()

  if (!state || state.status !== 'submitted' || !state.result) {
    return <Navigate to={ROUTES.test} replace />
  }

  const { result } = state
  const questions = questionsForTest(state)
  const percentage = Math.round(result.scorePercentage)

  const entries = questions.map((question, index) => {
    const selected = state.answers[question.id] ?? []
    const correctSet = [...question.correctOptionIds].sort()
    const selectedSet = [...selected].sort()
    const isRight =
      selectedSet.length === correctSet.length && selectedSet.every((id, i) => id === correctSet[i])
    return { question, index, selected, isRight }
  })
  const correctCount = entries.filter((entry) => entry.isRight).length
  const wrongCount = entries.length - correctCount
  const visible =
    filter === 'correct'
      ? entries.filter((entry) => entry.isRight)
      : filter === 'wrong'
        ? entries.filter((entry) => !entry.isRight)
        : entries

  return (
    <main className="bg-background mx-auto flex min-h-dvh w-full max-w-[880px] flex-col gap-5 px-4 py-8">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-[length:var(--font-size-h1)] font-bold tracking-tight">
          {t('test.results.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('test.results.candidate')}: {state.nickname}
        </p>
      </div>

      <Surface className="flex flex-wrap items-center gap-6">
        <ProgressRing
          value={percentage}
          label={`${percentage}%`}
          sublabel={t(GRADE_KEYS[result.grade] ?? 'grade.pass')}
          ariaLabel={t('results.accuracy')}
        />
        <div className="flex min-w-[220px] flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-3xl font-bold tabular-nums">{result.scorePoints}</span>
            <span className="text-muted-foreground font-medium">/ {result.maxScore}</span>
            <span className="text-muted-foreground text-sm">{t('test.results.score')}</span>
          </div>
          <Badge variant={state.forced || state.timedOut ? 'danger' : 'success'}>
            {state.timedOut
              ? t('test.results.timedOut')
              : state.forced
                ? t('test.results.forced')
                : t('test.results.normal')}
          </Badge>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label={t('results.correct')} value={result.correct} tone="success" />
            <StatTile label={t('results.wrong')} value={result.wrong} tone="danger" />
            <StatTile label={t('results.unanswered')} value={result.unanswered} tone="muted" />
          </div>
        </div>
      </Surface>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            clearTestState()
            navigate(ROUTES.test)
          }}
        >
          {t('test.results.retry')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            clearTestState()
            navigate(ROUTES.home)
          }}
        >
          {t('test.results.backHome')}
        </Button>
      </div>

      <Surface>
        <SectionHeader title={t('results.categoryBreakdown')} />
        <div className="mt-4 flex flex-col gap-3">
          {result.categoryStats.map((stat) => (
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

      <div className="flex flex-col gap-3">
        <SegmentedControl
          ariaLabel={t('test.results.filter.label')}
          value={filter}
          onChange={(value) => setFilter(value as ResultFilter)}
          size="sm"
          className="self-center"
          options={[
            { value: 'all', label: `${t('test.results.filter.all')} (${entries.length})` },
            { value: 'correct', label: `${t('test.results.filter.correct')} (${correctCount})` },
            { value: 'wrong', label: `${t('test.results.filter.wrong')} (${wrongCount})` },
          ]}
        />
        {visible.length === 0 ? (
          <EmptyState title={t('test.results.filter.empty')} />
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map(({ question, index, selected, isRight }) => (
              <li key={question.id}>
                <Surface className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-[var(--color-text-subtle)] tabular-nums">
                      {String(index + 1).padStart(2, '0')}
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
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-sm">
        <Link to={ROUTES.home}>{t('test.results.backHome')}</Link>
      </p>
    </main>
  )
}
