import { describe, expect, it } from 'vitest'
import type { AttemptAnswer } from '@/types/attempt'
import type { Question } from '@/types/quiz'
import { applyAttemptToReview, setMastered } from '@/services/reviewService'
import type { ReviewMap } from '@/types/review'

function question(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    category: 'scoring',
    type: 'single',
    difficulty: 'basic',
    question: { zh: 'q', en: 'q' },
    options: [
      { id: 'a', text: { zh: 'A', en: 'A' } },
      { id: 'b', text: { zh: 'B', en: 'B' } },
    ],
    correctOptionIds: ['a'],
    explanation: { zh: 'e', en: 'e' },
    ruleReference: 'BWF',
    ruleClause: 'Laws 7.1',
    ruleVersion: '2024',
    reviewStatus: 'verified',
    tags: ['scoring'],
    ...overrides,
  }
}

function answer(questionId: string, selectedOptionIds: string[]): AttemptAnswer {
  return { questionId, selectedOptionIds, answeredAt: null, markedForReview: false }
}

describe('reviewService', () => {
  it('creates exactly one review record per question, even after repeated wrong answers', () => {
    const q = question()
    const first = applyAttemptToReview([q], { q1: answer('q1', ['b']) }, {})
    expect(Object.keys(first)).toEqual(['q1'])
    expect(first['q1']?.wrongCount).toBe(1)

    const second = applyAttemptToReview([q], { q1: answer('q1', ['b']) }, first)
    expect(Object.keys(second)).toEqual(['q1'])
    expect(second['q1']?.wrongCount).toBe(2)
  })

  it('counts later correct answers without auto-removing the record', () => {
    const q = question()
    const wrong = applyAttemptToReview([q], { q1: answer('q1', ['b']) }, {})
    const corrected = applyAttemptToReview([q], { q1: answer('q1', ['a']) }, wrong)
    expect(corrected['q1']?.correctCountAfterWrong).toBe(1)
    expect(corrected['q1']?.mastered).toBe(false)
  })

  it('ignores unanswered questions', () => {
    const q = question()
    const map = applyAttemptToReview([q], { q1: answer('q1', []) }, {})
    expect(map).toEqual({})
  })

  it('marks and unmarks mastery with a timestamp', () => {
    const q = question()
    const base = applyAttemptToReview([q], { q1: answer('q1', ['b']) }, {})
    const mastered = setMastered(base, 'q1', true)
    expect(mastered['q1']?.mastered).toBe(true)
    expect(typeof mastered['q1']?.masteredAt).toBe('string')

    const unmastered = setMastered(mastered, 'q1', false)
    expect(unmastered['q1']?.mastered).toBe(false)
    expect(unmastered['q1']?.masteredAt).toBeNull()
  })

  it('leaves the map untouched when the question is unknown', () => {
    const map: ReviewMap = {}
    expect(setMastered(map, 'missing', true)).toBe(map)
  })
})
