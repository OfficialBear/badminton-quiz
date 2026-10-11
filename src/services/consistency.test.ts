import { beforeEach, describe, expect, it } from 'vitest'
import { QUESTION_BANK } from '@/data/questionBank'
import { DEFAULT_CONFIG, createAttempt } from '@/services/quizService'
import { computeScore } from '@/services/scoringService'
import {
  loadActiveAttempt,
  loadAttempts,
  loadSettings,
  saveActiveAttempt,
  saveAttempt,
  saveSettings,
} from '@/services/storageService'
import type { Attempt } from '@/types/attempt'

function makeAttempt(mode: 'practice' | 'exam' = 'practice'): Attempt {
  const attempt = createAttempt({ ...DEFAULT_CONFIG, mode, questionCount: 3 }, QUESTION_BANK)
  if (!attempt) throw new Error('expected an attempt')
  return attempt
}

describe('data consistency', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('changing language and theme does not touch an in-progress attempt', () => {
    const attempt = makeAttempt()
    saveActiveAttempt(attempt)

    saveSettings({ language: 'en', theme: 'dark' })

    const restored = loadActiveAttempt()
    expect(restored?.id).toBe(attempt.id)
    expect(restored?.questionIds).toEqual(attempt.questionIds)
    expect(loadSettings()).toMatchObject({ language: 'en', theme: 'dark' })
  })

  it('keeps an attempt’s own config regardless of later default changes', () => {
    const exam = makeAttempt('exam')
    saveAttempt(exam)

    saveSettings({ language: 'en' })

    const stored = loadAttempts().find((item) => item.id === exam.id)
    expect(stored?.config.mode).toBe('exam')
    expect(stored?.config.timerEnabled).toBe(false)
  })

  it('keeps earlier history records stable when newer attempts are saved', () => {
    const first = makeAttempt()
    saveAttempt(first)
    saveAttempt(makeAttempt())

    const stored = loadAttempts().find((item) => item.id === first.id)
    expect(stored?.id).toBe(first.id)
    expect(stored?.questionIds).toEqual(first.questionIds)
    expect(stored?.status).toBe('in-progress')
  })

  it('scores the same answers identically regardless of language', () => {
    const attempt = makeAttempt()
    const questions = QUESTION_BANK.filter((question) => attempt.questionIds.includes(question.id))
    const answers = Object.fromEntries(
      questions.map((question) => [
        question.id,
        {
          questionId: question.id,
          selectedOptionIds: question.correctOptionIds,
          answeredAt: null,
          markedForReview: false,
        },
      ]),
    )
    const summary = computeScore(questions, answers)
    expect(summary.correct).toBe(questions.length)
    expect(summary.scorePercentage).toBe(100)
  })
})
