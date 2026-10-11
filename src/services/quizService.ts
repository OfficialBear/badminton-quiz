import type { AttemptConfig, Attempt } from '../types/attempt'
import type { Question, QuestionOption } from '../types/quiz'
import { QUESTION_BANK, QUESTION_BANK_VERSION, RULE_VERSION } from '../data/questionBank'
import { createId } from '../utils/id'
import { shuffleWith, type RandomSource } from '../utils/shuffle'

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
  const timeLimitSeconds =
    config.timerEnabled && config.timerMinutes ? config.timerMinutes * 60 : null

  return {
    id: createId(),
    config,
    status: 'in-progress',
    startedAt: now.toISOString(),
    submittedAt: null,
    questionIds: questions.map((question) => question.id),
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

/** Stable option order for a question within an attempt (persisted at creation time). */
export function optionOrderFor(attempt: Attempt, question: Question): QuestionOption[] {
  if (!attempt.config.randomizeOptions) return question.options
  const seedKey = `${attempt.id}:${question.id}`
  return shuffleWithSeed(question.options, seedKey)
}

/** Deterministic shuffle so the same attempt restores the same option order. */
function shuffleWithSeed<T>(items: readonly T[], seed: string): T[] {
  let hash = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const random = () => {
    hash += 0x6d2b79f5
    let t = hash
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const a = result[i]
    const b = result[j]
    if (a !== undefined && b !== undefined) {
      result[i] = b
      result[j] = a
    }
  }
  return result
}
