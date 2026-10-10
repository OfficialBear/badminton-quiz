import type { CategoryId, Difficulty } from './quiz'

export type QuizMode = 'practice' | 'exam' | 'topic' | 'wrong'

export type AttemptStatus = 'in-progress' | 'submitted'

export interface AttemptConfig {
  mode: QuizMode
  topics: CategoryId[]
  difficulty: Difficulty | 'all'
  questionCount: number | 'all'
  randomizeQuestions: boolean
  randomizeOptions: boolean
  timerEnabled: boolean
  timerMinutes: number | null
}

export interface AttemptAnswer {
  questionId: string
  selectedOptionIds: string[]
  answeredAt: string | null
  markedForReview: boolean
}

export interface CategoryStat {
  category: CategoryId
  total: number
  correct: number
  wrong: number
  unanswered: number
  /** null when the category has no questions in this attempt. */
  accuracy: number | null
}

export interface Attempt {
  id: string
  config: AttemptConfig
  status: AttemptStatus
  startedAt: string
  submittedAt: string | null
  /** Question ids selected for this attempt, in stored order. */
  questionIds: string[]
  answers: Record<string, AttemptAnswer>
  timeLimitSeconds: number | null
  /** Absolute deadline (ISO). Timer is computed from this, not from counters. */
  deadlineAt: string | null
  elapsedSeconds: number | null
  totalQuestions: number
  correctCount: number | null
  wrongCount: number | null
  unansweredCount: number | null
  score: number | null
  scorePercentage: number | null
  categoryStats: CategoryStat[]
  questionBankVersion: string
  ruleVersion: string
}

export function isAnswerProvided(selectedOptionIds: string[]): boolean {
  return selectedOptionIds.length > 0
}
