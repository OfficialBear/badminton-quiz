import { beforeEach, describe, expect, it } from 'vitest'
import { QUESTION_BANK } from '@/data/questionBank'
import {
  MAX_TAB_SWITCHES,
  OFFICIAL_TEST_DURATION_SECONDS,
  OFFICIAL_TEST_MAX_SCORE,
  OFFICIAL_TEST_POINTS_PER_QUESTION,
  OFFICIAL_TEST_SIZE,
  OFFICIAL_TEST_STORAGE_KEY,
  buildTestPaper,
  clearTestState,
  createTestState,
  loadTestState,
  registerSwitch,
  saveTestState,
  submitTest,
  testRemainingSeconds,
} from '@/services/officialTestService'

describe('officialTestService', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    window.localStorage.clear()
  })

  it('builds a fixed 50-question paper that is identical every time', () => {
    const first = buildTestPaper(QUESTION_BANK).map((question) => question.id)
    const second = buildTestPaper(QUESTION_BANK).map((question) => question.id)
    expect(first).toHaveLength(OFFICIAL_TEST_SIZE)
    expect(new Set(first).size).toBe(OFFICIAL_TEST_SIZE)
    expect(first).toEqual(second)
  })

  it('curates the paper to be representative and discriminating', () => {
    const paper = buildTestPaper(QUESTION_BANK)
    expect(new Set(paper.map((question) => question.difficulty))).toEqual(
      new Set(['basic', 'intermediate', 'expert']),
    )
    expect(new Set(paper.map((question) => question.category)).size).toBe(6)
    const tags = new Set(paper.flatMap((question) => question.tags))
    expect(tags.has('singles')).toBe(true)
    expect(tags.has('doubles')).toBe(true)
  })

  it('returns null when fewer than 50 valid questions are available', () => {
    expect(createTestState('小明', QUESTION_BANK.slice(0, 10))).toBeNull()
  })

  it('trims the nickname and starts in-progress with no answers', () => {
    const state = createTestState('  小明  ')
    expect(state).not.toBeNull()
    expect(state?.nickname).toBe('小明')
    expect(state?.status).toBe('in-progress')
    expect(state?.tabSwitchCount).toBe(0)
    expect(state?.questionIds).toHaveLength(OFFICIAL_TEST_SIZE)
  })

  it('counts switches and only forces submission on the third one', () => {
    let state = createTestState('A')
    if (!state) throw new Error('expected state')

    state = registerSwitch(state)
    expect(state.tabSwitchCount).toBe(1)
    expect(state.status).toBe('in-progress')

    state = registerSwitch(state)
    expect(state.tabSwitchCount).toBe(2)
    expect(state.status).toBe('in-progress')

    state = registerSwitch(state)
    expect(state.tabSwitchCount).toBe(MAX_TAB_SWITCHES)
    expect(state.status).toBe('submitted')
    expect(state.forced).toBe(true)
  })

  it('never counts a switch again once submitted', () => {
    let state = createTestState('A')
    if (!state) throw new Error('expected state')
    for (let i = 0; i < MAX_TAB_SWITCHES; i += 1) state = registerSwitch(state)
    const after = registerSwitch(state)
    expect(after).toEqual(state)
  })

  it('computes a score summary and is idempotent on submit', () => {
    const state = createTestState('A')
    if (!state) throw new Error('expected state')
    const first = state.questionIds[0]
    if (!first) throw new Error('expected a question')
    const question = QUESTION_BANK.find((item) => item.id === first)
    if (!question) throw new Error('expected question in bank')
    const answered = { ...state, answers: { [first]: [...question.correctOptionIds] } }

    const submitted = submitTest(answered)
    expect(submitted.status).toBe('submitted')
    expect(submitted.result?.total).toBe(OFFICIAL_TEST_SIZE)
    expect(submitted.result?.correct).toBe(1)
    expect(submitted.result?.unanswered).toBe(OFFICIAL_TEST_SIZE - 1)
    expect(submitted.result?.scorePoints).toBe(OFFICIAL_TEST_POINTS_PER_QUESTION)
    expect(submitted.result?.maxScore).toBe(OFFICIAL_TEST_MAX_SCORE)
    expect(OFFICIAL_TEST_MAX_SCORE).toBe(OFFICIAL_TEST_SIZE * OFFICIAL_TEST_POINTS_PER_QUESTION)

    expect(submitTest(submitted, { forced: true })).toEqual(submitted)
  })

  it('persists to sessionStorage only, and survives a reload', () => {
    const state = createTestState('小明')
    if (!state) throw new Error('expected state')
    expect(saveTestState(state)).toBe(true)
    expect(loadTestState()?.nickname).toBe('小明')
    expect(window.localStorage.getItem(OFFICIAL_TEST_STORAGE_KEY)).toBeNull()
    expect(window.sessionStorage.getItem(OFFICIAL_TEST_STORAGE_KEY)).not.toBeNull()

    expect(clearTestState()).toBe(true)
    expect(loadTestState()).toBeNull()
  })

  it('returns null for corrupt stored state', () => {
    window.sessionStorage.setItem(OFFICIAL_TEST_STORAGE_KEY, '{not json')
    expect(loadTestState()).toBeNull()
  })

  it('starts a 45-minute absolute deadline and counts it down', () => {
    const state = createTestState('A')
    if (!state) throw new Error('expected state')
    expect(state.timedOut).toBe(false)
    const remaining = testRemainingSeconds(state)
    expect(remaining).toBeGreaterThan(OFFICIAL_TEST_DURATION_SECONDS - 5)
    expect(remaining).toBeLessThanOrEqual(OFFICIAL_TEST_DURATION_SECONDS)

    const deadline = new Date(state.deadlineAt).getTime()
    expect(testRemainingSeconds(state, deadline + 1000)).toBe(0)
  })

  it('marks a time-up submission as timedOut', () => {
    const state = createTestState('A')
    if (!state) throw new Error('expected state')
    const submitted = submitTest(state, { timedOut: true })
    expect(submitted.status).toBe('submitted')
    expect(submitted.timedOut).toBe(true)
    expect(submitted.forced).toBe(false)
  })
})
