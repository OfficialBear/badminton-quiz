import type { CategoryStat } from './attempt'

export type OfficialTestStatus = 'in-progress' | 'submitted'

export interface OfficialTestResult {
  total: number
  correct: number
  wrong: number
  unanswered: number
  scorePoints: number
  maxScore: number
  scorePercentage: number
  grade: string
  categoryStats: CategoryStat[]
}

/**
 * State of the standardised test. Persisted in sessionStorage only (never
 * localStorage) and intentionally NOT kept as a long-term record.
 */
export interface OfficialTestState {
  schemaVersion: number
  nickname: string
  /** Fixed 50-question paper, same for every candidate. */
  questionIds: string[]
  /** Selected option ids per question id. */
  answers: Record<string, string[]>
  currentIndex: number
  tabSwitchCount: number
  status: OfficialTestStatus
  /** Forced submission because the page-leave limit was reached. */
  forced: boolean
  /** Auto-submitted because the 45-minute time limit was reached. */
  timedOut: boolean
  startedAt: string
  /** Absolute deadline (ISO); the countdown is derived from it, not from counters. */
  deadlineAt: string
  submittedAt: string | null
  result: OfficialTestResult | null
}
