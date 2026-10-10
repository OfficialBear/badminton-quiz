import type { AttemptAnswer } from '../types/attempt'
import type { Question } from '../types/quiz'
import type { ReviewItem, ReviewMap } from '../types/review'
import { isCorrect } from './scoringService'

/**
 * Updates the review list after an attempt is submitted.
 * A question is added/updated when answered incorrectly; a wrong question that
 * is later answered correctly increments `correctCountAfterWrong` but is not
 * auto-removed (the user must mark it mastered, per the product spec).
 */
export function applyAttemptToReview(
  questions: Question[],
  answers: Record<string, AttemptAnswer>,
  current: ReviewMap,
): ReviewMap {
  const next: ReviewMap = { ...current }
  const now = new Date().toISOString()

  for (const question of questions) {
    const selected = answers[question.id]?.selectedOptionIds ?? []
    if (selected.length === 0) continue

    const existing = next[question.id]
    if (isCorrect(question, selected)) {
      if (existing) {
        next[question.id] = { ...existing, correctCountAfterWrong: existing.correctCountAfterWrong + 1 }
      }
      continue
    }

    if (existing) {
      next[question.id] = {
        ...existing,
        lastWrongAt: now,
        wrongCount: existing.wrongCount + 1,
        mastered: false,
        masteredAt: null,
      }
    } else {
      const item: ReviewItem = {
        questionId: question.id,
        firstWrongAt: now,
        lastWrongAt: now,
        wrongCount: 1,
        correctCountAfterWrong: 0,
        mastered: false,
        masteredAt: null,
      }
      next[question.id] = item
    }
  }

  return next
}

export function setMastered(map: ReviewMap, questionId: string, mastered: boolean): ReviewMap {
  const existing = map[questionId]
  if (!existing) return map
  return {
    ...map,
    [questionId]: {
      ...existing,
      mastered,
      masteredAt: mastered ? new Date().toISOString() : null,
    },
  }
}
