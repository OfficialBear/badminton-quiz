import { describe, expect, it } from 'vitest'
import { QUESTION_BANK } from '@/data/questionBank'
import {
  DEFAULT_CONFIG,
  availableQuestions,
  createAttempt,
  sampleQuestions,
} from '@/services/quizService'
import { createSeededRandom } from '@/utils/shuffle'

describe('quizService', () => {
  it('never repeats questions and respects the requested count', () => {
    const questions = sampleQuestions({ ...DEFAULT_CONFIG, questionCount: 5 }, QUESTION_BANK)
    expect(questions).toHaveLength(5)
    expect(new Set(questions.map((question) => question.id)).size).toBe(5)
  })

  it('does not exceed the available pool', () => {
    const questions = sampleQuestions({ ...DEFAULT_CONFIG, questionCount: 999 }, QUESTION_BANK)
    expect(questions.length).toBeLessThanOrEqual(QUESTION_BANK.length)
  })

  it('filters by category and difficulty', () => {
    const pool = availableQuestions(
      { ...DEFAULT_CONFIG, topics: ['service'], difficulty: 'all' },
      QUESTION_BANK,
    )
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every((question) => question.category === 'service')).toBe(true)
  })

  it('filters by question type', () => {
    const pool = availableQuestions(
      { ...DEFAULT_CONFIG, questionTypes: ['multiple'] },
      QUESTION_BANK,
    )
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every((question) => question.type === 'multiple')).toBe(true)
  })

  it('is deterministic for a fixed random source', () => {
    const config = { ...DEFAULT_CONFIG, questionCount: 6, randomizeQuestions: true }
    const first = sampleQuestions(config, QUESTION_BANK, createSeededRandom(42)).map((q) => q.id)
    const second = sampleQuestions(config, QUESTION_BANK, createSeededRandom(42)).map((q) => q.id)
    expect(first).toEqual(second)
  })

  it('returns the whole pool for questionCount "all"', () => {
    const config = { ...DEFAULT_CONFIG, questionCount: 'all' as const }
    expect(sampleQuestions(config, QUESTION_BANK)).toHaveLength(QUESTION_BANK.length)
  })

  it('keeps the configured order when randomization is off', () => {
    const config = { ...DEFAULT_CONFIG, randomizeQuestions: false, questionCount: 3 }
    const ids = sampleQuestions(config, QUESTION_BANK).map((question) => question.id)
    expect(ids).toEqual(QUESTION_BANK.slice(0, 3).map((question) => question.id))
  })

  it('builds an attempt whose questionIds match the sampled questions', () => {
    const attempt = createAttempt({ ...DEFAULT_CONFIG, questionCount: 4 }, QUESTION_BANK)
    expect(attempt).not.toBeNull()
    expect(attempt?.status).toBe('in-progress')
    expect(attempt?.questionIds).toHaveLength(4)
    expect(attempt?.totalQuestions).toBe(4)
  })

  it('returns null when no question matches the filters', () => {
    const attempt = createAttempt({ ...DEFAULT_CONFIG, questionCount: 5 }, [])
    expect(attempt).toBeNull()
  })
})
