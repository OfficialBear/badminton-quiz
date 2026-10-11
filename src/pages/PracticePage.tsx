import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Button, Checkbox, RadioList, SectionHeader, Select, Surface } from '@/components/ui'
import { useI18n } from '@/i18n/I18nContext'
import type { MessageKey } from '@/i18n'
import { CATEGORIES } from '@/data/categories'
import { MODES } from '@/data/modes'
import { QUESTION_BANK } from '@/data/questionBank'
import { ROUTES, quizPath } from '@/router/paths'
import { createAttempt, sampleQuestions } from '@/services/quizService'
import { saveActiveAttempt, saveAttempt } from '@/services/storageService'
import type { AttemptConfig } from '@/types/attempt'
import type { CategoryId, Difficulty } from '@/types/quiz'

const COUNT_VALUES: (number | 'all')[] = [10, 20, 30, 50, 'all']
const TIMER_VALUES = ['none', '10', '20', '30'] as const
type TimerValue = (typeof TIMER_VALUES)[number]

const DIFFICULTY_LABELS: Record<Difficulty | 'all', MessageKey> = {
  all: 'common.all',
  basic: 'difficulty.basic',
  intermediate: 'difficulty.intermediate',
  expert: 'difficulty.expert',
}

export function PracticePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialMode = (searchParams.get('mode') ?? 'practice') as AttemptConfig['mode']
  const initialTopic = searchParams.get('topic')

  const [mode, setMode] = useState<AttemptConfig['mode']>(initialMode)
  const [topics, setTopics] = useState<CategoryId[]>(
    initialTopic ? [initialTopic as CategoryId] : [],
  )
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [count, setCount] = useState<number | 'all'>(20)
  const [randomizeQuestions, setRandomizeQuestions] = useState(true)
  const [randomizeOptions, setRandomizeOptions] = useState(false)
  const [timerValue, setTimerValue] = useState<TimerValue>('none')

  const config = useMemo<AttemptConfig>(
    () => ({
      mode,
      topics,
      difficulty,
      questionCount: count,
      randomizeQuestions,
      randomizeOptions,
      timerEnabled: mode === 'exam' && timerValue !== 'none',
      timerMinutes: mode === 'exam' && timerValue !== 'none' ? Number(timerValue) : null,
    }),
    [mode, topics, difficulty, count, randomizeQuestions, randomizeOptions, timerValue],
  )

  const available = useMemo(() => sampleQuestions(config, QUESTION_BANK).length, [config])

  const start = () => {
    const attempt = createAttempt(config, QUESTION_BANK)
    if (!attempt) return
    saveAttempt(attempt)
    saveActiveAttempt(attempt)
    navigate(quizPath(attempt.id))
  }

  const topicOptions = [
    { value: 'all', label: t('topics.all') },
    ...CATEGORIES.map((category) => ({ value: category.id, label: t(category.labelKey) })),
  ]

  const countOptions = COUNT_VALUES.map((value) => ({
    value: String(value),
    label: value === 'all' ? t('setup.count.all') : String(value),
  }))

  const timerOptions = TIMER_VALUES.map((value) => ({
    value,
    label: value === 'none' ? t('setup.timer.none') : `${value} ${t('common.minutes')}`,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[length:var(--font-size-h1)] font-bold tracking-tight">
          {t('practice.title')}
        </h1>
        <p className="text-muted-foreground">{t('setup.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,620px)_320px] lg:items-start lg:justify-between">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-3">
            <SectionHeader title={t('setup.mode.label')} />
            <RadioList
              name="mode"
              value={mode}
              onChange={(value) => setMode(value as AttemptConfig['mode'])}
              ariaLabel={t('setup.mode.label')}
              columns={2}
              options={MODES.map((item) => ({
                value: item.id,
                title: t(item.titleKey),
                description: t(item.descKey),
              }))}
            />
          </section>

          <section className="flex flex-col gap-3">
            <SectionHeader title={t('setup.topic.label')} />
            <Select
              id="practice-topic"
              value={topics[0] ?? 'all'}
              onChange={(event) => {
                const value = event.target.value
                setTopics(value === 'all' ? [] : [value as CategoryId])
              }}
              options={topicOptions}
            />
          </section>

          <section className="flex flex-col gap-3">
            <SectionHeader title={t('setup.difficulty.label')} />
            <RadioList
              name="difficulty"
              value={difficulty}
              onChange={(value) => setDifficulty(value as Difficulty | 'all')}
              ariaLabel={t('setup.difficulty.label')}
              columns={2}
              options={[
                { value: 'all', title: t('common.all') },
                { value: 'basic', title: t('difficulty.basic') },
                { value: 'intermediate', title: t('difficulty.intermediate') },
                { value: 'expert', title: t('difficulty.expert') },
              ]}
            />
          </section>

          <section className="flex flex-col gap-3">
            <SectionHeader title={t('setup.count.label')} />
            <Select
              id="practice-count"
              value={String(count)}
              onChange={(event) => {
                const value = event.target.value
                setCount(value === 'all' ? 'all' : Number(value))
              }}
              options={countOptions}
            />
            {mode === 'exam' ? (
              <Select
                id="practice-timer"
                label={t('setup.timer.label')}
                value={timerValue}
                onChange={(event) => setTimerValue(event.target.value as TimerValue)}
                options={timerOptions}
              />
            ) : null}
            <Checkbox
              id="practice-randomize"
              label={t('setup.random.label')}
              checked={randomizeQuestions}
              onChange={setRandomizeQuestions}
            />
            <Checkbox
              id="practice-randomize-options"
              label={t('setup.randomizeOptions.label')}
              checked={randomizeOptions}
              onChange={setRandomizeOptions}
            />
          </section>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-height)+var(--space-4))]">
          <Surface className="flex flex-col gap-4">
            <SectionHeader title={t('practice.config')} />
            <dl className="flex flex-col gap-2">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t('setup.summary.mode')}</dt>
                <dd className="font-medium">
                  {t(MODES.find((item) => item.id === mode)?.titleKey ?? 'mode.practice')}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t('setup.summary.count')}</dt>
                <dd className="font-medium tabular-nums">
                  {count === 'all' ? t('setup.count.all') : count}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t('setup.summary.difficulty')}</dt>
                <dd className="font-medium">{t(DIFFICULTY_LABELS[difficulty])}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t('setup.summary.timer')}</dt>
                <dd className="font-medium">
                  {mode === 'exam' && timerValue !== 'none'
                    ? `${timerValue} ${t('common.minutes')}`
                    : t('setup.timer.none')}
                </dd>
              </div>
            </dl>
            {available === 0 ? (
              <Alert variant="warning" title={t('practice.noQuestions')} />
            ) : (
              <Button fullWidth size="lg" onClick={start}>
                {t('practice.start')}
              </Button>
            )}
            <p className="text-muted-foreground text-xs">
              {t('setup.count.label')}: {available}
            </p>
            <Button variant="ghost" fullWidth onClick={() => navigate(ROUTES.home)}>
              {t('common.back')}
            </Button>
          </Surface>
        </aside>
      </div>
    </div>
  )
}
