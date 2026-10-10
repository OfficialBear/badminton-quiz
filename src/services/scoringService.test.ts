import { describe, expect, it } from 'vitest'
import { computeScore, gradeFor, isCorrect } from '@/services/scoringService'
import type { Question } from '@/types/quiz'

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    category: 'scoring',
    type: 'single',
    difficulty: 'basic',
    question: { zh: 'q', en: 'q' },
    options: [
      { id: 'a', text: { zh: 'a', en: 'a' } },
      { id: 'b', text: { zh: 'b', en: 'b' } },
    ],
    correctOptionIds: ['a'],
    explanation: { zh: 'e', en: 'e' },
    ruleReference: 'BWF',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: [],
    ...overrides,
  }
}

describe('scoringService', () => {
  it('judges single-choice exactly', () => {
    const question = makeQuestion()
    expect(isCorrect(question, ['a'])).toBe(true)
    expect(isCorrect(question, ['b'])).toBe(false)
    expect(isCorrect(question, [])).toBe(false)
  })

  it('ignores option order for multiple choice', () => {
    const question = makeQuestion({ type: 'multiple', correctOptionIds: ['a', 'b'] })
    expect(isCorrect(question, ['b', 'a'])).toBe(true)
    expect(isCorrect(question, ['a'])).toBe(false)
    expect(isCorrect(question, ['a', 'b', 'c'])).toBe(false)
  })

  it('computes counts, percentage and category stats', () => {
    const questions = [
      makeQuestion({ id: 'q1', correctOptionIds: ['a'] }),
      makeQuestion({ id: 'q2', category: 'service', correctOptionIds: ['a'] }),
      makeQuestion({ id: 'q3', category: 'service', correctOptionIds: ['a'] }),
    ]
    const summary = computeScore(questions, {
      q1: { questionId: 'q1', selectedOptionIds: ['a'], answeredAt: null, markedForReview: false },
      q2: { questionId: 'q2', selectedOptionIds: ['b'], answeredAt: null, markedForReview: false },
    })
    expect(summary.total).toBe(3)
    expect(summary.correct).toBe(1)
    expect(summary.wrong).toBe(1)
    expect(summary.unanswered).toBe(1)
    expect(summary.scorePercentage).toBeCloseTo(33.3, 1)
    const service = summary.categoryStats.find((stat) => stat.category === 'service')
    expect(service?.total).toBe(2)
    expect(service?.accuracy).toBe(0)
  })

  it('maps grade boundaries', () => {
    expect(gradeFor(90)).toBe('excellent')
    expect(gradeFor(89.9)).toBe('good')
    expect(gradeFor(75)).toBe('good')
    expect(gradeFor(60)).toBe('pass')
    expect(gradeFor(59.9)).toBe('needs-improvement')
  })

  it('handles an empty paper', () => {
    const summary = computeScore([], {})
    expect(summary.total).toBe(0)
    expect(summary.scorePercentage).toBe(0)
  })
})
