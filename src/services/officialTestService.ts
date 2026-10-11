import { QUESTION_BANK } from '../data/questionBank'
import { TEST_PAPER_IDS } from '../data/testPaper'
import { computeScore, gradeFor } from './scoringService'
import { computeRemainingSeconds } from '../utils/time'
import type { Question } from '../types/quiz'
import type { AttemptAnswer } from '../types/attempt'
import type { OfficialTestResult, OfficialTestState } from '../types/officialTest'

export const OFFICIAL_TEST_SCHEMA_VERSION = 3
export const OFFICIAL_TEST_STORAGE_KEY = 'badminton-quiz:test-session'
export const OFFICIAL_TEST_SIZE = 50
export const OFFICIAL_TEST_POINTS_PER_QUESTION = 2
export const OFFICIAL_TEST_MAX_SCORE = OFFICIAL_TEST_SIZE * OFFICIAL_TEST_POINTS_PER_QUESTION
export const MAX_TAB_SWITCHES = 3
export const NICKNAME_MAX_LENGTH = 20
export const OFFICIAL_TEST_DURATION_SECONDS = 45 * 60

function byId(a: Question, b: Question): number {
  return a.id.localeCompare(b.id)
}

export function buildTestPaper(bank: Question[] = QUESTION_BANK): Question[] {
  const verified = bank.filter((question) => question.reviewStatus === 'verified')
  const byIdMap = new Map(verified.map((question) => [question.id, question]))
  const paper: Question[] = []
  const used = new Set<string>()

  for (const id of TEST_PAPER_IDS) {
    const question = byIdMap.get(id)
    if (question && !used.has(question.id)) {
      paper.push(question)
      used.add(question.id)
    }
  }

  if (paper.length < OFFICIAL_TEST_SIZE) {
    for (const question of verified.slice().sort(byId)) {
      if (paper.length >= OFFICIAL_TEST_SIZE) break
      if (used.has(question.id)) continue
      paper.push(question)
      used.add(question.id)
    }
  }

  return paper.slice(0, OFFICIAL_TEST_SIZE)
}

export function normalizeNickname(value: string): string {
  return value.trim().slice(0, NICKNAME_MAX_LENGTH)
}

export function isValidNickname(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length > 0 && trimmed.length <= NICKNAME_MAX_LENGTH
}

export function createTestState(nickname: string, bank: Question[] = QUESTION_BANK): OfficialTestState | null {
  const paper = buildTestPaper(bank)
  if (paper.length < OFFICIAL_TEST_SIZE) return null
  const now = Date.now()
  return {
    schemaVersion: OFFICIAL_TEST_SCHEMA_VERSION,
    nickname: normalizeNickname(nickname),
    questionIds: paper.map((question) => question.id),
    answers: {},
    currentIndex: 0,
    tabSwitchCount: 0,
    status: 'in-progress',
    forced: false,
    timedOut: false,
    startedAt: new Date(now).toISOString(),
    deadlineAt: new Date(now + OFFICIAL_TEST_DURATION_SECONDS * 1000).toISOString(),
    submittedAt: null,
    result: null,
  }
}

export function testRemainingSeconds(state: OfficialTestState, now: number = Date.now()): number | null {
  return computeRemainingSeconds(state.deadlineAt, now)
}

function toAttemptAnswers(state: OfficialTestState): Record<string, AttemptAnswer> {
  const result: Record<string, AttemptAnswer> = {}
  for (const [questionId, selectedOptionIds] of Object.entries(state.answers)) {
    result[questionId] = {
      questionId,
      selectedOptionIds,
      answeredAt: null,
      markedForReview: false,
    }
  }
  return result
}

export function questionsForTest(state: OfficialTestState, bank: Question[] = QUESTION_BANK): Question[] {
  const byIdMap = new Map(bank.map((question) => [question.id, question]))
  return state.questionIds
    .map((id) => byIdMap.get(id))
    .filter((question): question is Question => question !== undefined)
}

export interface SubmitOptions {
  forced?: boolean
  timedOut?: boolean
}

export function submitTest(
  state: OfficialTestState,
  options: SubmitOptions = {},
  bank: Question[] = QUESTION_BANK,
): OfficialTestState {
  if (state.status === 'submitted') return state
  const questions = questionsForTest(state, bank)
  const summary = computeScore(questions, toAttemptAnswers(state))
  const result: OfficialTestResult = {
    total: summary.total,
    correct: summary.correct,
    wrong: summary.wrong,
    unanswered: summary.unanswered,
    scorePoints: summary.correct * OFFICIAL_TEST_POINTS_PER_QUESTION,
    maxScore: summary.total * OFFICIAL_TEST_POINTS_PER_QUESTION,
    scorePercentage: summary.scorePercentage,
    grade: gradeFor(summary.scorePercentage),
    categoryStats: summary.categoryStats,
  }
  return {
    ...state,
    status: 'submitted',
    forced: options.forced === true,
    timedOut: options.timedOut === true,
    submittedAt: new Date().toISOString(),
    result,
  }
}

export function registerSwitch(state: OfficialTestState, bank: Question[] = QUESTION_BANK): OfficialTestState {
  if (state.status === 'submitted') return state
  const tabSwitchCount = state.tabSwitchCount + 1
  const counted: OfficialTestState = { ...state, tabSwitchCount }
  if (tabSwitchCount >= MAX_TAB_SWITCHES) return submitTest(counted, { forced: true }, bank)
  return counted
}

function storage(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function loadTestState(): OfficialTestState | null {
  const store = storage()
  if (!store) return null
  const raw = store.getItem(OFFICIAL_TEST_STORAGE_KEY)
  if (raw === null) return null
  try {
    const parsed = JSON.parse(raw) as OfficialTestState
    if (parsed === null || typeof parsed !== 'object') return null
    if (parsed.schemaVersion !== OFFICIAL_TEST_SCHEMA_VERSION) return null
    if (typeof parsed.nickname !== 'string' || !Array.isArray(parsed.questionIds)) return null
    if (typeof parsed.deadlineAt !== 'string') return null
    if (parsed.status !== 'in-progress' && parsed.status !== 'submitted') return null
    return parsed
  } catch {
    return null
  }
}

export function saveTestState(state: OfficialTestState): boolean {
  const store = storage()
  if (!store) return false
  try {
    store.setItem(OFFICIAL_TEST_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearTestState(): boolean {
  const store = storage()
  if (!store) return false
  try {
    store.removeItem(OFFICIAL_TEST_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
