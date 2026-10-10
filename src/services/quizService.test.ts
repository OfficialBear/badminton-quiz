import { describe, expect, it } from 'vitest'
import { QUESTION_BANK } from '@/data/questionBank'
import {
  DEFAULT_CONFIG,
  availableQuestions,
  createAttempt,
  sampleQuestions,
} from '@/services/quizService'

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

  it('builds an attempt whose questionIds match the sampled questions', () => {
    const attempt = createAttempt({ ...DEFAULT_CONFIG, questionCount: 4 }, QUESTION_BANK)
    expect(attempt).not.toBeNull()
    expect(attempt?.status).toBe('in-progress')
    expect(attempt?.questionIds).toHaveLength(4)
    expect(attempt?.totalQuestions).toBe(4)
  })

  it('returns null when no question matches the filters', () => {
    const attempt = createAttempt(
      { ...DEFAULT_CONFIG, topics: ['officials'], difficulty: 'basic' },
      QUESTION_BANK,
    )
    expect(attempt).toBeNull()
  })
})
