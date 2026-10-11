import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QUESTION_BANK } from '@/data/questionBank'
import { DEFAULT_CONFIG, createAttempt } from '@/services/quizService'
import {
  ATTEMPTS_SCHEMA_VERSION,
  DEFAULT_SETTINGS,
  META_SCHEMA_VERSION,
  STORAGE_KEYS,
  clearAllData,
  exportData,
  getLastStorageError,
  loadActiveAttempt,
  loadAttempts,
  loadMeta,
  loadReview,
  loadSettings,
  normalizeAttempt,
  runMigrations,
  saveActiveAttempt,
  saveAttempt,
  saveReview,
  saveSettings,
  subscribeStorageError,
  writeJSON,
} from '@/services/storageService'
import type { Attempt } from '@/types/attempt'

function makeAttempt(): Attempt {
  const attempt = createAttempt({ ...DEFAULT_CONFIG, questionCount: 3 }, QUESTION_BANK)
  if (!attempt) throw new Error('expected an attempt to be created')
  return attempt
}

describe('storageService', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns safe defaults on first access', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
    expect(loadAttempts()).toEqual([])
    expect(loadActiveAttempt()).toBeNull()
    expect(loadReview()).toEqual({})
    expect(loadMeta().schemaVersion).toBe(META_SCHEMA_VERSION)
  })

  it('round-trips settings', () => {
    expect(saveSettings({ language: 'en' })).toBe(true)
    expect(loadSettings().language).toBe('en')
    expect(loadSettings().theme).toBe('light')
  })

  it('persists and restores an in-progress attempt (refresh recovery)', () => {
    const attempt = makeAttempt()
    const withProgress: Attempt = { ...attempt, currentIndex: 2 }
    expect(saveActiveAttempt(withProgress)).toBe(true)
    expect(saveAttempt(withProgress)).toBe(true)

    const restored = loadActiveAttempt()
    expect(restored?.id).toBe(withProgress.id)
    expect(restored?.questionIds).toEqual(withProgress.questionIds)
    expect(restored?.questionOrder).toEqual(withProgress.questionOrder)
    expect(restored?.currentIndex).toBe(2)
  })

  it('surfaces corrupt JSON instead of failing silently', () => {
    window.localStorage.setItem(STORAGE_KEYS.attempts, '{not valid json')
    expect(loadAttempts()).toEqual([])
    expect(getLastStorageError()?.code).toBe('parse-failed')
  })

  it('normalizes stored attempts, repairing missing and corrupt fields', () => {
    const repaired = normalizeAttempt({ id: 'x', questionIds: ['q-scoring-01'] })
    expect(repaired?.currentIndex).toBe(0)
    expect(repaired?.questionOrder).toEqual(['q-scoring-01'])
    expect(repaired?.optionOrders).toEqual({})
    expect(repaired?.answers).toEqual({})
    expect(repaired?.config.mode).toBe('practice')

    const messy = normalizeAttempt({
      id: 'y',
      questionIds: ['q-scoring-01'],
      currentIndex: 99,
      answers: {
        'q-scoring-01': { selectedOptionIds: [1, 'true'], answeredAt: 5, markedForReview: 'yes' },
        other: {},
      },
    })
    expect(messy?.answers['q-scoring-01']?.selectedOptionIds).toEqual(['true'])
    expect(messy?.answers['q-scoring-01']?.answeredAt).toBeNull()
    expect(messy?.answers['other']).toBeUndefined()
    expect(messy?.currentIndex).toBe(0)
  })

  it('replaces a duplicate attempt id instead of duplicating it', () => {
    const attempt = makeAttempt()
    saveAttempt(attempt)
    saveAttempt({ ...attempt, status: 'submitted' })
    const stored = loadAttempts().filter((item) => item.id === attempt.id)
    expect(stored).toHaveLength(1)
    expect(stored[0]?.status).toBe('submitted')
  })

  it('migrates older schema versions in place', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.attempts,
      JSON.stringify({ schemaVersion: 0, data: [makeAttempt()] }),
    )
    const report = runMigrations()
    expect(report.migrated).toContain(STORAGE_KEYS.attempts)
    expect(loadAttempts()).toHaveLength(1)
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.attempts) ?? '{}') as {
      schemaVersion?: number
    }
    expect(stored.schemaVersion).toBe(ATTEMPTS_SCHEMA_VERSION)
  })

  it('quarantines data from a newer schema version with a backup', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.review,
      JSON.stringify({ schemaVersion: 99, data: { 'q-scoring-01': {} } }),
    )
    const report = runMigrations()
    expect(report.recovered).toContain(STORAGE_KEYS.review)
    expect(window.localStorage.getItem(`${STORAGE_KEYS.review}:recovered`)).not.toBeNull()
    expect(getLastStorageError()?.code).toBe('version-incompatible')
    expect(loadReview()).toEqual({})
  })

  it('exports a self-describing JSON bundle', () => {
    saveSettings({ language: 'en' })
    saveAttempt(makeAttempt())
    const bundle = JSON.parse(exportData()) as {
      app: string
      attempts: unknown[]
      settings: { language: string }
      meta: unknown
    }
    expect(bundle.app).toBe('badminton-quiz')
    expect(bundle.attempts).toHaveLength(1)
    expect(bundle.settings.language).toBe('en')
    expect(bundle.meta).toBeDefined()
  })

  it('reports an error and returns false when storage is unavailable', () => {
    const codes: string[] = []
    const unsubscribe = subscribeStorageError((error) => codes.push(error.code))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    expect(writeJSON('k', { a: 1 })).toBe(false)
    expect(codes).toContain('unavailable')
    expect(getLastStorageError()?.code).toBe('unavailable')
    unsubscribe()
  })

  it('clears all learning data', () => {
    saveSettings({ language: 'en' })
    saveAttempt(makeAttempt())
    saveActiveAttempt(makeAttempt())
    saveReview({})

    expect(clearAllData()).toBe(true)
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
    expect(loadAttempts()).toEqual([])
    expect(loadActiveAttempt()).toBeNull()
    expect(loadReview()).toEqual({})
    expect(window.localStorage.getItem(STORAGE_KEYS.meta)).toBeNull()
  })
})
