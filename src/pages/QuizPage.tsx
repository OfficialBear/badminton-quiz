import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  FlagIcon,
  GridIcon,
} from '@/components/icons'
import { Badge, EmptyState, IconButton, OptionRow } from '@/components/ui'
import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/dialog'
import { Progress } from '@/components/shadcn/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/shadcn/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shadcn/tooltip'
import { useI18n } from '@/i18n/I18nContext'
import { QUESTION_BANK } from '@/data/questionBank'
import { categoryLabelKey, difficultyLabelKey, questionTypeLabelKey } from '@/data/categories'
import { modeLabelKey } from '@/data/modes'
import { ROUTES, resultsPath } from '@/router/paths'
import { computeScore } from '@/services/scoringService'
import { optionOrderFor, questionsForAttempt, usesDraftQuestions } from '@/services/quizService'
import { applyAttemptToReview } from '@/services/reviewService'
import {
  clearActiveAttempt,
  loadActiveAttempt,
  loadAttempts,
  loadReview,
  saveActiveAttempt,
  saveAttempt,
  saveReview,
} from '@/services/storageService'
import type { Attempt, AttemptAnswer } from '@/types/attempt'
import type { QuestionType } from '@/types/quiz'
import { cn } from '@/lib/utils'
import { computeRemainingSeconds } from '@/utils/time'

const MARKERS = 'ABCDEFGH'

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function QuizPage() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const { attemptId } = useParams<{ attemptId: string }>()

  const [attempt, setAttempt] = useState<Attempt | null>(() => {
    if (!attemptId) return null
    const active = loadActiveAttempt()
    if (active && active.id === attemptId) return active
    return loadAttempts().find((item) => item.id === attemptId) ?? null
  })
  const [index, setIndex] = useState(() => attempt?.currentIndex ?? 0)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [navigatorOpen, setNavigatorOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const submittedRef = useRef(false)
  const [remaining, setRemaining] = useState<number | null>(() =>
    computeRemainingSeconds(attempt?.deadlineAt ?? null, Date.now()),
  )

  const questions = useMemo(
    () => (attempt ? questionsForAttempt(attempt, QUESTION_BANK) : []),
    [attempt],
  )
  const question = questions[index]
  const isExam = attempt?.config.mode === 'exam'

  const persist = useCallback((next: Attempt) => {
    setAttempt(next)
    saveActiveAttempt(next)
    saveAttempt(next)
  }, [])

  const goBack = useCallback(() => {
    const state = window.history.state as { idx?: number } | null
    if (state && typeof state.idx === 'number' && state.idx > 0) {
      navigate(-1)
    } else {
      navigate(ROUTES.home)
    }
  }, [navigate])

  const submitAttempt = useCallback(
    (auto = false) => {
      if (!attempt || submittedRef.current) return
      submittedRef.current = true
      const summary = computeScore(questions, attempt.answers)
      const submitted: Attempt = {
        ...attempt,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        elapsedSeconds: Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000),
        correctCount: summary.correct,
        wrongCount: summary.wrong,
        unansweredCount: summary.unanswered,
        score: summary.score,
        scorePercentage: summary.scorePercentage,
        categoryStats: summary.categoryStats,
      }
      saveAttempt(submitted)
      saveReview(applyAttemptToReview(questions, attempt.answers, loadReview()))
      clearActiveAttempt()
      navigate(resultsPath(submitted.id), { replace: true, state: { autoSubmitted: auto } })
    },
    [attempt, questions, navigate],
  )

  const deadlineAt = attempt?.deadlineAt ?? null
  useEffect(() => {
    if (!deadlineAt) return
    const tick = () => setRemaining(computeRemainingSeconds(deadlineAt, Date.now()))
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [deadlineAt])

  useEffect(() => {
    if (attempt && attempt.status === 'in-progress' && remaining === 0) {
      submitAttempt(true)
    }
  }, [remaining, attempt, submitAttempt])

  if (!attempt || questions.length === 0) {
    return (
      <EmptyState
        icon={<GridIcon size={22} />}
        title={t('quiz.notFound.title')}
        description={t('quiz.notFound.body')}
        action={<Button onClick={() => navigate(ROUTES.practice)}>{t('practice.start')}</Button>}
      />
    )
  }

  const answerOf = (id: string): AttemptAnswer | undefined => attempt.answers[id]
  const answeredCount = questions.filter(
    (item) => (answerOf(item.id)?.selectedOptionIds.length ?? 0) > 0,
  ).length
  const markedCount = questions.filter((item) => answerOf(item.id)?.markedForReview).length

  const goTo = (nextIndex: number) => {
    const clamped = Math.min(Math.max(nextIndex, 0), questions.length - 1)
    setIndex(clamped)
    setNavigatorOpen(false)
    if (attempt.status === 'in-progress') persist({ ...attempt, currentIndex: clamped })
  }

  const toggleOptions = (questionId: string, optionId: string, type: QuestionType) => {
    if (!attempt || attempt.status !== 'in-progress') return
    const existing = answerOf(questionId)
    const current = existing?.selectedOptionIds ?? []
    const isMulti = type === 'multiple'
    const selectedOptionIds = isMulti
      ? current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      : [optionId]

    const nextAnswers: Record<string, AttemptAnswer> = {
      ...attempt.answers,
      [questionId]: {
        questionId,
        selectedOptionIds,
        answeredAt: new Date().toISOString(),
        markedForReview: existing?.markedForReview ?? false,
      },
    }
    persist({ ...attempt, answers: nextAnswers })
    if (!isExam) setRevealed((prev) => ({ ...prev, [questionId]: true }))
  }

  const toggleMark = (questionId: string) => {
    if (!attempt || attempt.status !== 'in-progress') return
    const existing = answerOf(questionId)
    const nextAnswers: Record<string, AttemptAnswer> = {
      ...attempt.answers,
      [questionId]: {
        questionId,
        selectedOptionIds: existing?.selectedOptionIds ?? [],
        answeredAt: existing?.answeredAt ?? null,
        markedForReview: !(existing?.markedForReview ?? false),
      },
    }
    persist({ ...attempt, answers: nextAnswers })
  }

  if (!question) return null

  const options = optionOrderFor(attempt, question)
  const selected = answerOf(question.id)?.selectedOptionIds ?? []
  const showFeedback = !isExam && revealed[question.id] === true && selected.length > 0
  const correctSet = new Set(question.correctOptionIds)
  const isCurrentCorrect =
    showFeedback &&
    selected.some((id) => correctSet.has(id)) &&
    selected.length === question.correctOptionIds.length
  const draftInSession = usesDraftQuestions(questions)

  const navigator = (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-2">
      {questions.map((item, itemIndex) => {
        const answered = (answerOf(item.id)?.selectedOptionIds.length ?? 0) > 0
        const marked = answerOf(item.id)?.markedForReview ?? false
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              'border-border bg-card text-muted-foreground min-h-10 rounded-sm border tabular-nums',
              answered && 'bg-[var(--color-primary-soft)] border-primary text-primary font-semibold',
              marked && 'border-[var(--color-warning)] shadow-[inset_0_-3px_0_var(--color-warning)]',
              itemIndex === index && 'outline-2 outline-[var(--color-focus)] outline-offset-1',
            )}
            aria-current={itemIndex === index ? 'true' : undefined}
            aria-label={String(itemIndex + 1)}
            onClick={() => goTo(itemIndex)}
          >
            {itemIndex + 1}
          </button>
        )
      })}
    </div>
  )

  return (
    <main className="bg-background flex min-h-dvh flex-col">
      <header className="bg-card border-border sticky top-0 z-20 border-b">
        <div className="mx-auto flex min-h-[var(--header-height)] w-full max-w-[760px] items-center gap-3 px-4 py-2">
          <IconButton label={t('common.back')} onClick={goBack}>
            <ChevronLeftIcon />
          </IconButton>
          <span className="font-semibold whitespace-nowrap">{t(modeLabelKey(attempt.config.mode))}</span>
          <span className="text-muted-foreground text-sm whitespace-nowrap tabular-nums">
            {t('quiz.question', { current: index + 1, total: questions.length })}
          </span>
          {remaining !== null ? (
            <span
              className={cn(
                'bg-muted inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium',
                remaining <= 30 && 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
              )}
            >
              <ClockIcon size={16} />
              <span className="tabular-nums">{formatClock(remaining)}</span>
            </span>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="border-border bg-card inline-flex min-h-10 items-center gap-1 rounded-md border px-3 text-sm"
                  aria-label={t('quiz.openNavigator')}
                  onClick={() => setNavigatorOpen(true)}
                >
                  <GridIcon size={18} />
                  <span className="whitespace-nowrap max-[480px]:hidden">
                    {t('quiz.openNavigator')}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('quiz.navigator')}</TooltipContent>
            </Tooltip>
            <Button size="sm" onClick={() => setSubmitOpen(true)}>
              {t('quiz.submit')}
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[760px] px-4 pb-2">
          <Progress
            value={questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}
            className="h-1.5"
            aria-label={t('quiz.answered')}
          />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center gap-4 px-4 py-6">
        {draftInSession ? (
          <p className="text-sm text-[var(--color-warning)]">{t('quiz.draftNotice')}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">{t(questionTypeLabelKey(question.type))}</Badge>
          <Badge variant="neutral">{t(difficultyLabelKey(question.difficulty))}</Badge>
          <Badge variant="neutral">{t(categoryLabelKey(question.category))}</Badge>
          <button
            type="button"
            className={cn(
              'border-border bg-card text-muted-foreground ml-auto inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-sm',
              answerOf(question.id)?.markedForReview &&
                'border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
            )}
            onClick={() => toggleMark(question.id)}
            aria-pressed={answerOf(question.id)?.markedForReview ?? false}
          >
            <FlagIcon size={16} />
            {answerOf(question.id)?.markedForReview
              ? t('quiz.unmarkForReview')
              : t('quiz.markForReview')}
          </button>
        </div>

        <h1 className="text-[length:var(--font-size-h2)] leading-snug font-semibold">
          {question.question[language]}
        </h1>
        {question.type === 'multiple' ? (
          <p className="text-muted-foreground text-sm">
            {t('quiz.selectMultiple')} · {t('quiz.selectedCount', { count: selected.length })}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {options.map((option, optionIndex) => {
            const isCorrectOption = correctSet.has(option.id)
            const isChosen = selected.includes(option.id)
            const state = showFeedback
              ? isCorrectOption
                ? 'correct'
                : isChosen
                  ? 'wrong'
                  : 'idle'
              : 'idle'
            return (
              <OptionRow
                key={option.id}
                name={question.id}
                type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                optionId={option.id}
                marker={MARKERS[optionIndex] ?? String(optionIndex + 1)}
                checked={isChosen}
                state={state}
                disabled={showFeedback}
                onSelect={() => toggleOptions(question.id, option.id, question.type)}
              >
                {option.text[language]}
              </OptionRow>
            )
          })}
        </div>

        {showFeedback ? (
          <div
            className={cn(
              'flex flex-col gap-2 rounded-md border p-4',
              isCurrentCorrect
                ? 'bg-[var(--color-success-bg)] border-[var(--color-success-border)]'
                : 'bg-[var(--color-danger-bg)] border-[var(--color-danger-border)]',
            )}
          >
            <span
              className={cn(
                'font-semibold',
                isCurrentCorrect
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-danger)]',
              )}
            >
              {isCurrentCorrect ? t('quiz.practice.correct') : t('quiz.practice.wrong')}
            </span>
            <p className="leading-relaxed">{question.explanation[language]}</p>
            <p className="text-muted-foreground text-sm">
              {t('results.ruleReference')}: {question.ruleReference}
            </p>
          </div>
        ) : null}
      </div>

      <div className="bg-background sticky bottom-0 z-10 border-t border-[var(--color-divider)]">
        <div className="mx-auto flex max-w-[760px] justify-center gap-6 px-4 py-3">
          <Button variant="outline" disabled={index === 0} onClick={() => goTo(index - 1)}>
            <ChevronLeftIcon size={18} />
            {t('quiz.prev')}
          </Button>
          {index < questions.length - 1 ? (
            <Button onClick={() => goTo(index + 1)}>
              {t('quiz.next')}
              <ChevronRightIcon size={18} />
            </Button>
          ) : (
            <Button onClick={() => setSubmitOpen(true)}>{t('quiz.complete')}</Button>
          )}
        </div>
      </div>

      <Sheet open={navigatorOpen} onOpenChange={setNavigatorOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('quiz.navigator')}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{navigator}</div>
        </SheetContent>
      </Sheet>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('quiz.submitTitle')}</DialogTitle>
            <DialogDescription>
              {t('quiz.submitBody', {
                answered: answeredCount,
                unanswered: questions.length - answeredCount,
                marked: markedCount,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => submitAttempt(false)}>{t('quiz.submitConfirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
