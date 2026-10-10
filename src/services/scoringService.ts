import type { CategoryId, Question } from '../types/quiz'
import type { AttemptAnswer, CategoryStat } from '../types/attempt'

export interface ScoreSummary {
  total: number
  correct: number
  wrong: number
  unanswered: number
  score: number
  scorePercentage: number
  categoryStats: CategoryStat[]
}

export type GradeId = 'excellent' | 'good' | 'pass' | 'needs-improvement'

/** Exact set match, ignoring order. Empty selection is never correct. */
export function isCorrect(question: Question, selectedOptionIds: string[]): boolean {
  if (selectedOptionIds.length === 0) return false
  const selected = [...selectedOptionIds].sort()
  const correct = [...question.correctOptionIds].sort()
  if (selected.length !== correct.length) return false
  return selected.every((id, index) => id === correct[index])
}

export function computeScore(
  questions: Question[],
  answers: Record<string, AttemptAnswer>,
): ScoreSummary {
  let correct = 0
  let wrong = 0
  let unanswered = 0
  const byCategory = new Map<
    CategoryId,
    { total: number; correct: number; wrong: number; unanswered: number }
  >()

  for (const question of questions) {
    const selected = answers[question.id]?.selectedOptionIds ?? []
    const stat = byCategory.get(question.category) ?? { total: 0, correct: 0, wrong: 0, unanswered: 0 }
    stat.total += 1

    if (selected.length === 0) {
      unanswered += 1
      stat.unanswered += 1
    } else if (isCorrect(question, selected)) {
      correct += 1
      stat.correct += 1
    } else {
      wrong += 1
      stat.wrong += 1
    }
    byCategory.set(question.category, stat)
  }

  const total = questions.length
  const scorePercentage = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0
  const categoryStats: CategoryStat[] = [...byCategory.entries()].map(([category, stat]) => ({
    category,
    total: stat.total,
    correct: stat.correct,
    wrong: stat.wrong,
    unanswered: stat.unanswered,
    accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 1000) / 10 : null,
  }))

  return {
    total,
    correct,
    wrong,
    unanswered,
    score: correct,
    scorePercentage,
    categoryStats,
  }
}

/** Product-defined grade (not an official officiating qualification). */
export function gradeFor(scorePercentage: number): GradeId {
  if (scorePercentage >= 90) return 'excellent'
  if (scorePercentage >= 75) return 'good'
  if (scorePercentage >= 60) return 'pass'
  return 'needs-improvement'
}
