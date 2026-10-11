import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useBlocker, useNavigate } from 'react-router-dom'
import { Alert, Badge, Button, Dialog, OptionRow } from '@/components/ui'
import { Progress } from '@/components/shadcn/progress'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'
import { useI18n } from '@/i18n/I18nContext'
import { categoryLabelKey, difficultyLabelKey, questionTypeLabelKey } from '@/data/categories'
import { ROUTES } from '@/router/paths'
import {
  MAX_TAB_SWITCHES,
  loadTestState,
  questionsForTest,
  registerSwitch,
  saveTestState,
  submitTest,
  testRemainingSeconds,
} from '@/services/officialTestService'
import type { OfficialTestState } from '@/types/officialTest'

const MARKERS = 'ABCDEFGH'

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function TestPaperPage() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const [state, setState] = useState<OfficialTestState | null>(() => loadTestState())
  const [submitOpen, setSubmitOpen] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() =>
    state ? testRemainingSeconds(state) : null,
  )
  const submittedRef = useRef(false)
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const persist = useCallback((next: OfficialTestState) => {
    setState(next)
    stateRef.current = next
    saveTestState(next)
  }, [])

  const goToResults = useCallback(() => {
    navigate(ROUTES.testResults, { replace: true })
  }, [navigate])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return
      const current = stateRef.current
      if (!current || current.status !== 'in-progress') return
      const next = registerSwitch(current)
      persist(next)
      if (next.status === 'submitted') goToResults()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [persist, goToResults])

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        stateRef.current?.status === 'in-progress' &&
        currentLocation.pathname !== nextLocation.pathname,
      [],
    ),
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    const current = stateRef.current
    if (!current || current.status !== 'in-progress') {
      blocker.proceed()
      return
    }
    const next = registerSwitch(current)
    persist(next)
    if (next.status === 'submitted') {
      blocker.reset()
      goToResults()
    } else {
      blocker.proceed()
    }
  }, [blocker, persist, goToResults])

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (stateRef.current?.status !== 'in-progress') return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  useEffect(() => {
    if (!state || state.status !== 'in-progress') return
    const timer = window.setInterval(() => setRemainingSeconds(testRemainingSeconds(state)), 1000)
    return () => window.clearInterval(timer)
  }, [state])

  useEffect(() => {
    if (remainingSeconds !== 0 || !state || state.status !== 'in-progress' || submittedRef.current) return
    submittedRef.current = true
    persist(submitTest(state, { timedOut: true }))
    goToResults()
  }, [remainingSeconds, state, persist, goToResults])

  if (!state) return <Navigate to={ROUTES.test} replace />
  if (state.status === 'submitted') return <Navigate to={ROUTES.testResults} replace />

  const questions = questionsForTest(state)
  const question = questions[Math.min(state.currentIndex, questions.length - 1)]
  if (!question) return <Navigate to={ROUTES.test} replace />

  const index = Math.min(state.currentIndex, questions.length - 1)
  const answeredCount = state.questionIds.filter((id) => (state.answers[id]?.length ?? 0) > 0).length
  const remaining = Math.max(0, MAX_TAB_SWITCHES - state.tabSwitchCount)
  const selected = state.answers[question.id] ?? []

  const setAnswer = (optionId: string) => {
    if (state.status !== 'in-progress') return
    const current = state.answers[question.id] ?? []
    const isMulti = question.type === 'multiple'
    const nextOptions = isMulti
      ? current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      : [optionId]
    persist({ ...state, answers: { ...state.answers, [question.id]: nextOptions } })
  }

  const goTo = (nextIndex: number) => {
    const clamped = Math.min(Math.max(nextIndex, 0), questions.length - 1)
    persist({ ...state, currentIndex: clamped })
  }

  const confirmSubmit = () => {
    persist(submitTest(state))
    setSubmitOpen(false)
    goToResults()
  }

  return (
    <main className="bg-background flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">{t('test.title')}</h1>
        <Badge variant="info">{state.nickname}</Badge>
        <span className="text-muted-foreground text-sm tabular-nums">
          {t('quiz.question', { current: index + 1, total: questions.length })}
        </span>
        {remainingSeconds !== null ? (
          <span className="text-sm font-medium tabular-nums">
            {t('test.timeRemaining')} {formatClock(remainingSeconds)}
          </span>
        ) : null}
        <span className="ml-auto flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {t('test.tabCount')}: <span className="tabular-nums">{state.tabSwitchCount}</span> ·{' '}
            {t('test.remaining', { count: remaining })}
          </span>
          <Button size="sm" onClick={() => setSubmitOpen(true)}>
            {t('test.submit')}
          </Button>
        </span>
      </div>

      <Progress
        value={questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}
        className="h-1.5"
        aria-label={t('test.progress')}
      />

      {state.tabSwitchCount > 0 ? (
        <Alert
          variant={remaining <= 1 ? 'danger' : 'warning'}
          title={
            remaining <= 1
              ? t('test.tabWarnLast')
              : t('test.tabWarnRemaining', { count: remaining })
          }
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{t(questionTypeLabelKey(question.type))}</Badge>
        <Badge variant="neutral">{t(difficultyLabelKey(question.difficulty))}</Badge>
        <Badge variant="neutral">{t(categoryLabelKey(question.category))}</Badge>
      </div>

      <h2 className="text-[length:var(--font-size-h2)] leading-snug font-semibold">
        {question.question[language]}
      </h2>

      <div className="flex flex-col gap-3">
        {question.options.map((option, optionIndex) => (
          <OptionRow
            key={option.id}
            name={question.id}
            type={question.type === 'multiple' ? 'checkbox' : 'radio'}
            optionId={option.id}
            marker={MARKERS[optionIndex] ?? String(optionIndex + 1)}
            checked={selected.includes(option.id)}
            onSelect={() => setAnswer(option.id)}
          >
            {option.text[language]}
          </OptionRow>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 border-t border-[var(--color-divider)] py-3">
        <Button variant="secondary" disabled={index === 0} onClick={() => goTo(index - 1)}>
          <ChevronLeftIcon size={18} />
          {t('quiz.prev')}
        </Button>
        {index < questions.length - 1 ? (
          <Button onClick={() => goTo(index + 1)}>
            {t('quiz.next')}
            <ChevronRightIcon size={18} />
          </Button>
        ) : (
          <Button onClick={() => setSubmitOpen(true)}>{t('test.submit')}</Button>
        )}
      </div>

      <Dialog
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title={t('test.submitTitle')}
        closeLabel={t('common.close')}
        description={t('test.submitBody', {
          answered: answeredCount,
          unanswered: questions.length - answeredCount,
        })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSubmitOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={confirmSubmit}>{t('test.submitConfirm')}</Button>
          </>
        }
      />
      </div>
    </main>
  )
}
