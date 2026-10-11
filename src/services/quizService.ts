import type { AttemptConfig, Attempt } from '../types/attempt'
import type { Question, QuestionOption } from '../types/quiz'
import { QUESTION_BANK, QUESTION_BANK_VERSION, RULE_VERSION } from '../data/questionBank'
import { createId } from '../utils/id'
import { shuffleWith, createSeededRandom, type RandomSource } from '../utils/shuffle'

export const DEFAULT_CONFIG: AttemptConfig = {
  mode: 'practice',
  topics: [],
  difficulty: 'all',
  questionCount: 20,
  randomizeQuestions: true,
  randomizeOptions: false,
  timerEnabled: false,
  timerMinutes: null,
}

/** Questions that may be presented (verified + draft samples, never needs-review). */
export function isAvailable(question: Question): boolean {
  return question.reviewStatus !== 'needs-review'
}

export function usesDraftQuestions(questions: Question[]): boolean {
  return questions.some((question) => question.reviewStatus !== 'verified')
}

export function availableQuestions(
  config: AttemptConfig,
  bank: Question[] = QUESTION_BANK,
): Question[] {
  return bank.filter((question) => {
    if (!isAvailable(question)) return false
    if (config.topics.length > 0 && !config.topics.includes(question.category)) return false
    if (config.difficulty !== 'all' && question.difficulty !== config.difficulty) return false
    if (
      config.questionTypes &&
      config.questionTypes.length > 0 &&
      !config.questionTypes.includes(question.type)
    ) {
      return false
    }
    return true
  })
}

/** Picks unique questions; never repeats and never exceeds the available count. */
export function sampleQuestions(
  config: AttemptConfig,
  bank: Question[] = QUESTION_BANK,
  rng: RandomSource = Math.random,
): Question[] {
  const pool = availableQuestions(config, bank)
  const ordered = config.randomizeQuestions ? shuffleWith(pool, rng) : pool
  if (config.questionCount === 'all') return ordered
  const requested = Math.max(0, Math.floor(config.questionCount))
  return ordered.slice(0, Math.min(requested, ordered.length))
}

export function createAttemptFromQuestions(
  config: AttemptConfig,
  questions: Question[],
): Attempt | null {
  if (questions.length === 0) return null

  const now = new Date()
  const id = createId()
  const timeLimitSeconds =
    config.timerEnabled && config.timerMinutes ? config.timerMinutes * 60 : null
  const questionIds = questions.map((question) => question.id)
  const optionOrders: Record<string, string[]> = {}
  if (config.randomizeOptions) {
    for (const question of questions) {
      optionOrders[question.id] = shuffleWith(
        question.options.map((option) => option.id),
        createSeededRandom(hashSeed(`${id}:${question.id}`)),
      )
    }
  }

  return {
    id,
    config,
    status: 'in-progress',
    startedAt: now.toISOString(),
    submittedAt: null,
    questionIds,
    questionOrder: questionIds,
    optionOrders,
    currentIndex: 0,
    answers: {},
    timeLimitSeconds,
    deadlineAt:
      timeLimitSeconds !== null ? new Date(now.getTime() + timeLimitSeconds * 1000).toISOString() : null,
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
}

export function createAttempt(
  config: AttemptConfig,
  bank: Question[] = QUESTION_BANK,
  rng: RandomSource = Math.random,
): Attempt | null {
  return createAttemptFromQuestions(config, sampleQuestions(config, bank, rng))
}

export function questionsForAttempt(attempt: Attempt, bank: Question[] = QUESTION_BANK): Question[] {
  const byId = new Map(bank.map((question) => [question.id, question]))
  return attempt.questionIds
    .map((id) => byId.get(id))
    .filter((question): question is Question => question !== undefined)
}

export function optionOrderFor(attempt: Attempt, question: Question): QuestionOption[] {
  const stored = attempt.optionOrders?.[question.id]
  if (stored && stored.length > 0) {
    const byId = new Map(question.options.map((option) => [option.id, option]))
    const ordered = stored
      .map((id) => byId.get(id))
      .filter((option): option is QuestionOption => option !== undefined)
    if (ordered.length === question.options.length) return ordered
  }
  if (!attempt.config.randomizeOptions) return question.options
  return shuffleWith(question.options, createSeededRandom(hashSeed(`${attempt.id}:${question.id}`)))
}

function hashSeed(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
