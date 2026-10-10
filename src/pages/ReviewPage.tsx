import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckIcon, RefreshIcon, TargetIcon, TrashIcon } from '@/components/icons'
import { Badge, Button, Checkbox, Dialog, EmptyState, Select, Surface } from '@/components/ui'
import { useI18n } from '@/i18n/I18nContext'
import { QUESTION_BANK, QUESTION_BANK_VERSION, RULE_VERSION } from '@/data/questionBank'
import { CATEGORIES, difficultyLabelKey } from '@/data/categories'
import { quizPath } from '@/router/paths'
import { setMastered } from '@/services/reviewService'
import { createId } from '@/utils/id'
import { loadReview, saveActiveAttempt, saveAttempt, saveReview } from '@/services/storageService'
import type { Attempt } from '@/types/attempt'
import type { CategoryId, Difficulty } from '@/types/quiz'
import { cn } from '@/lib/utils'

export function ReviewPage() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const [review, setReview] = useState(() => loadReview())
  const [category, setCategory] = useState<'all' | CategoryId>('all')
  const [difficulty, setDifficulty] = useState<'all' | Difficulty>('all')
  const [onlyUnmastered, setOnlyUnmastered] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [clearOpen, setClearOpen] = useState(false)

  const byId = new Map(QUESTION_BANK.map((question) => [question.id, question]))
  const items = Object.values(review)
    .map((item) => ({ item, question: byId.get(item.questionId) }))
    .filter(
      (entry): entry is { item: (typeof review)[string]; question: NonNullable<typeof entry.question> } =>
        entry.question !== undefined,
    )
    .filter((entry) => (onlyUnmastered ? !entry.item.mastered : true))
    .filter((entry) => (category === 'all' ? true : entry.question.category === category))
    .filter((entry) => (difficulty === 'all' ? true : entry.question.difficulty === difficulty))
    .sort((a, b) => (a.item.lastWrongAt < b.item.lastWrongAt ? 1 : -1))

  const unmastered = Object.values(review).filter((item) => !item.mastered)

  const persist = (next: typeof review) => {
    setReview(next)
    saveReview(next)
  }

  const toggleMastered = (questionId: string, mastered: boolean) => {
    persist(setMastered(review, questionId, mastered))
  }

  const startRedo = () => {
    const questions = unmastered
      .map((item) => byId.get(item.questionId))
      .filter((question): question is NonNullable<typeof question> => question !== undefined)
    if (questions.length === 0) return
    const now = new Date()
    const attempt: Attempt = {
      id: createId(),
      config: {
        mode: 'wrong',
        topics: [],
        difficulty: 'all',
        questionCount: questions.length,
        randomizeQuestions: false,
        randomizeOptions: false,
        timerEnabled: false,
        timerMinutes: null,
      },
      status: 'in-progress',
      startedAt: now.toISOString(),
      submittedAt: null,
      questionIds: questions.map((question) => question.id),
      answers: {},
      timeLimitSeconds: null,
      deadlineAt: null,
      elapsedSeconds: null,
      totalQuestions: questions.length,
      correctCount: null,
      wrongCount: null,
      unansweredCount: null,
      score: null,
      scorePercentage: null,
      categoryStats: [],
      questionBankVersion: QUESTION_BANK_VERSION,
      ruleVersion: RULE_VERSION,
    }
    saveAttempt(attempt)
    saveActiveAttempt(attempt)
    navigate(quizPath(attempt.id))
  }

  if (Object.keys(review).length === 0) {
    return (
      <EmptyState
        icon={<TargetIcon size={22} />}
        title={t('review.empty.title')}
        description={t('review.empty.body')}
        action={<Button onClick={() => navigate('/practice')}>{t('practice.start')}</Button>}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline gap-3">
        <h1 className="text-[length:var(--font-size-h1)] font-bold tracking-tight">
          {t('review.title')}
        </h1>
        <span className="text-muted-foreground">{t('review.count', { count: items.length })}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-[190px]">
          <Select
            aria-label={t('review.filter.category')}
            value={category}
            onChange={(event) => setCategory(event.target.value as 'all' | CategoryId)}
            options={[
              { value: 'all', label: t('review.allCategories') },
              ...CATEGORIES.map((item) => ({ value: item.id, label: t(item.labelKey) })),
            ]}
          />
        </div>
        <div className="w-full sm:w-[190px]">
          <Select
            aria-label={t('review.filter.difficulty')}
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as 'all' | Difficulty)}
            options={[
              { value: 'all', label: t('common.all') },
              { value: 'basic', label: t('difficulty.basic') },
              { value: 'intermediate', label: t('difficulty.intermediate') },
              { value: 'expert', label: t('difficulty.expert') },
            ]}
          />
        </div>
        <Checkbox
          label={t('review.onlyUnmastered')}
          checked={onlyUnmastered}
          onChange={setOnlyUnmastered}
        />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button onClick={startRedo} disabled={unmastered.length === 0}>
            <RefreshIcon size={18} />
            {t('results.goReview')}
          </Button>
          <Button variant="ghost" onClick={() => setClearOpen(true)}>
            <TrashIcon size={18} />
            {t('review.clear')}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<CheckIcon size={22} />} title={t('review.empty.title')} />
      ) : (
        <ul className="border-border bg-card divide-border divide-y overflow-hidden rounded-xl border">
          {items.map(({ item, question }) => (
            <li key={item.questionId}>
              <Surface className="rounded-none border-0 px-5 py-4">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 text-left"
                  aria-expanded={expanded === item.questionId}
                  onClick={() =>
                    setExpanded((current) =>
                      current === item.questionId ? null : item.questionId,
                    )
                  }
                >
                  <span className="font-medium leading-relaxed">
                    {question.question[language]}
                  </span>
                  <span className="flex flex-none flex-wrap gap-2">
                    <Badge variant="neutral">{t(difficultyLabelKey(question.difficulty))}</Badge>
                    <Badge variant={item.mastered ? 'success' : 'danger'}>
                      {item.mastered ? t('review.unmarkMastered') : t('quiz.practice.wrong')}
                    </Badge>
                  </span>
                </button>

                {expanded === item.questionId ? (
                  <div className="mt-3 flex flex-col gap-3 border-t border-[var(--color-divider)] pt-3">
                    <ul className="flex flex-col gap-2">
                      {question.options.map((option) => (
                        <li
                          key={option.id}
                          className={cn(
                            'border-border rounded-md border px-3 py-2 text-sm',
                            question.correctOptionIds.includes(option.id) &&
                              'border-[var(--color-success-border)] bg-[var(--color-success-bg)]',
                          )}
                        >
                          {option.text[language]}
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted-foreground leading-relaxed">
                      {question.explanation[language]}
                    </p>
                    <p className="text-xs text-[var(--color-text-subtle)]">
                      {t('results.ruleReference')}: {question.ruleReference}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={item.mastered ? 'secondary' : 'primary'}
                        onClick={() => toggleMastered(item.questionId, !item.mastered)}
                      >
                        {item.mastered ? t('review.unmarkMastered') : t('review.markMastered')}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Surface>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title={t('review.clearConfirm.title')}
        closeLabel={t('common.close')}
        description={t('review.clearConfirm.body')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setClearOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                persist({})
                setClearOpen(false)
              }}
            >
              {t('common.delete')}
            </Button>
          </>
        }
      />
    </div>
  )
}
