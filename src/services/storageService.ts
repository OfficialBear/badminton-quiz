import type { Language, Theme } from '../types/common'
import type { Attempt, AttemptAnswer, AttemptConfig, CategoryStat, QuizMode } from '../types/attempt'
import type { ReviewMap } from '../types/review'
import type { CategoryId, Difficulty, QuestionType } from '../types/quiz'

export const STORAGE_KEYS = {
  settings: 'badminton-quiz:settings',
  attempts: 'badminton-quiz:attempts',
  activeAttempt: 'badminton-quiz:active-attempt',
  review: 'badminton-quiz:review',
  meta: 'badminton-quiz:meta',
} as const

export const SETTINGS_SCHEMA_VERSION = 1
export const ATTEMPTS_SCHEMA_VERSION = 1
export const REVIEW_SCHEMA_VERSION = 1
export const META_SCHEMA_VERSION = 1
const MAX_STORED_ATTEMPTS = 100

const LANGUAGES: readonly Language[] = ['zh', 'en']
const THEMES: readonly Theme[] = ['light', 'dark', 'system']
const QUIZ_MODES: readonly QuizMode[] = ['practice', 'exam', 'topic', 'wrong']
const CATEGORY_IDS: readonly CategoryId[] = ['scoring', 'service', 'court', 'faults', 'officials', 'scenario']
const DIFFICULTIES: readonly Difficulty[] = ['basic', 'intermediate', 'expert']
const QUESTION_TYPE_IDS: readonly QuestionType[] = ['true-false', 'single', 'multiple', 'scenario']

/* ------------------------------------------------------------------ errors */

export type StorageErrorCode =
  | 'unavailable'
  | 'write-failed'
  | 'parse-failed'
  | 'version-incompatible'

export interface StorageError {
  code: StorageErrorCode
  message: string
  key?: string
  at: string
}

const errorListeners = new Set<(error: StorageError) => void>()
let lastStorageError: StorageError | null = null

export function subscribeStorageError(listener: (error: StorageError) => void): () => void {
  errorListeners.add(listener)
  return () => {
    errorListeners.delete(listener)
  }
}

export function getLastStorageError(): StorageError | null {
  return lastStorageError
}

function reportStorageError(code: StorageErrorCode, message: string, key?: string): void {
  const error: StorageError = { code, message, key, at: new Date().toISOString() }
  lastStorageError = error
  for (const listener of errorListeners) listener(error)
}

/* ------------------------------------------------------------- primitives */

export function isStorageAvailable(): boolean {
  try {
    const probe = '__badminton_quiz_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(key)
  } catch {
    reportStorageError('unavailable', 'localStorage is not readable', key)
    return fallback
  }
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    reportStorageError('parse-failed', 'Stored value is not valid JSON', key)
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    const code: StorageErrorCode = isStorageAvailable() ? 'write-failed' : 'unavailable'
    reportStorageError(code, error instanceof Error ? error.message : 'Failed to write', key)
    return false
  }
}

function removeKey(key: string): boolean {
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    reportStorageError('unavailable', 'localStorage is not writable', key)
    return false
  }
}

interface Envelope<T> {
  schemaVersion: number
  data: T
}

function readEnvelope<T>(key: string, schemaVersion: number, fallback: T): T {
  const raw = readJSON<unknown>(key, null)
  if (raw === null || typeof raw !== 'object') return fallback
  const envelope = raw as { schemaVersion?: unknown; data?: unknown }
  if (envelope.schemaVersion !== schemaVersion) {
    if (typeof envelope.schemaVersion === 'number') {
      reportStorageError('version-incompatible', 'Stored data has a different schema version', key)
    }
    return fallback
  }
  if (envelope.data === undefined) return fallback
  return envelope.data as T
}

function writeEnvelope<T>(key: string, schemaVersion: number, data: T): boolean {
  const envelope: Envelope<T> = { schemaVersion, data }
  return writeJSON(key, envelope)
}

/* --------------------------------------------------------------- settings */

export interface Settings {
  schemaVersion: number
  language: Language
  theme: Theme
}

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  language: 'zh',
  theme: 'light',
}

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}

function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

export function loadSettings(): Settings {
  const raw = readJSON<unknown>(STORAGE_KEYS.settings, null)
  const record = raw !== null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    language: isLanguage(record['language']) ? record['language'] : DEFAULT_SETTINGS.language,
    theme: isTheme(record['theme']) ? record['theme'] : DEFAULT_SETTINGS.theme,
  }
}

export function saveSettings(patch: Partial<Settings>): boolean {
  const current = loadSettings()
  const next: Settings = {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    language: isLanguage(patch.language) ? patch.language : current.language,
    theme: isTheme(patch.theme) ? patch.theme : current.theme,
  }
  return writeJSON(STORAGE_KEYS.settings, next)
}

/* -------------------------------------------------------------------- meta */

export interface Meta {
  schemaVersion: number
  questionBankVersion: string
  ruleVersion: string
  lastOpenedAt: string | null
  lastMigrationAt: string | null
}

export const DEFAULT_META: Meta = {
  schemaVersion: META_SCHEMA_VERSION,
  questionBankVersion: '',
  ruleVersion: '',
  lastOpenedAt: null,
  lastMigrationAt: null,
}

export function loadMeta(): Meta {
  const raw = readJSON<unknown>(STORAGE_KEYS.meta, null)
  const envelope = raw !== null && typeof raw === 'object' ? (raw as { data?: unknown }) : {}
  const data =
    envelope.data !== null && typeof envelope.data === 'object'
      ? (envelope.data as Record<string, unknown>)
      : {}
  return {
    schemaVersion: META_SCHEMA_VERSION,
    questionBankVersion:
      typeof data['questionBankVersion'] === 'string' ? data['questionBankVersion'] : '',
    ruleVersion: typeof data['ruleVersion'] === 'string' ? data['ruleVersion'] : '',
    lastOpenedAt: typeof data['lastOpenedAt'] === 'string' ? data['lastOpenedAt'] : null,
    lastMigrationAt: typeof data['lastMigrationAt'] === 'string' ? data['lastMigrationAt'] : null,
  }
}

export function saveMeta(patch: Partial<Meta>): boolean {
  const current = loadMeta()
  return writeEnvelope(STORAGE_KEYS.meta, META_SCHEMA_VERSION, {
    ...current,
    ...patch,
    schemaVersion: META_SCHEMA_VERSION,
  })
}

export function touchLastOpened(): boolean {
  return saveMeta({ lastOpenedAt: new Date().toISOString() })
}

/* ---------------------------------------------------------------- attempts */

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function normalizeConfig(raw: unknown): AttemptConfig {
  const record = raw !== null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const mode =
    typeof record['mode'] === 'string' && (QUIZ_MODES as readonly string[]).includes(record['mode'])
      ? (record['mode'] as QuizMode)
      : 'practice'
  const topics = asStringArray(record['topics']).filter((value): value is CategoryId =>
    (CATEGORY_IDS as readonly string[]).includes(value),
  )
  const difficulty =
    typeof record['difficulty'] === 'string' &&
    (DIFFICULTIES as readonly string[]).includes(record['difficulty'])
      ? (record['difficulty'] as Difficulty | 'all')
      : 'all'
  const questionTypes = asStringArray(record['questionTypes']).filter((value): value is QuestionType =>
    (QUESTION_TYPE_IDS as readonly string[]).includes(value),
  )
  const questionCount =
    record['questionCount'] === 'all'
      ? ('all' as const)
      : typeof record['questionCount'] === 'number' && Number.isFinite(record['questionCount'])
        ? record['questionCount']
        : ('all' as const)
  const timerMinutes =
    typeof record['timerMinutes'] === 'number' && Number.isFinite(record['timerMinutes'])
      ? record['timerMinutes']
      : null
  return {
    mode,
    topics,
    difficulty,
    questionTypes: questionTypes.length > 0 ? questionTypes : undefined,
    questionCount,
    randomizeQuestions: record['randomizeQuestions'] !== false,
    randomizeOptions: record['randomizeOptions'] === true,
    timerEnabled: record['timerEnabled'] === true,
    timerMinutes,
  }
}

function normalizeAnswer(raw: unknown, questionId: string): AttemptAnswer {
  const record = raw !== null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    questionId,
    selectedOptionIds: asStringArray(record['selectedOptionIds']),
    answeredAt: typeof record['answeredAt'] === 'string' ? record['answeredAt'] : null,
    markedForReview: record['markedForReview'] === true,
  }
}

function normalizeOptionOrders(raw: unknown, questionIds: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  if (raw === null || typeof raw !== 'object') return result
  const record = raw as Record<string, unknown>
  for (const questionId of questionIds) {
    const order = record[questionId]
    if (Array.isArray(order)) result[questionId] = asStringArray(order)
  }
  return result
}

function normalizeAnswers(raw: unknown, questionIds: string[]): Record<string, AttemptAnswer> {
  const result: Record<string, AttemptAnswer> = {}
  if (raw === null || typeof raw !== 'object') return result
  const record = raw as Record<string, unknown>
  for (const questionId of questionIds) {
    if (questionId in record) result[questionId] = normalizeAnswer(record[questionId], questionId)
  }
  return result
}

function normalizeCategoryStats(raw: unknown): CategoryStat[] {
  if (!Array.isArray(raw)) return []
  const stats: CategoryStat[] = []
  for (const item of raw) {
    if (item === null || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    if (typeof record['category'] !== 'string') continue
    if (!(CATEGORY_IDS as readonly string[]).includes(record['category'])) continue
    stats.push({
      category: record['category'] as CategoryId,
      total: typeof record['total'] === 'number' ? record['total'] : 0,
      correct: typeof record['correct'] === 'number' ? record['correct'] : 0,
      wrong: typeof record['wrong'] === 'number' ? record['wrong'] : 0,
      unanswered: typeof record['unanswered'] === 'number' ? record['unanswered'] : 0,
      accuracy: typeof record['accuracy'] === 'number' ? record['accuracy'] : null,
    })
  }
  return stats
}

/** Turns any stored value into a safe Attempt, repairing missing/corrupt fields. */
export function normalizeAttempt(raw: unknown): Attempt | null {
  if (raw === null || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  if (typeof record['id'] !== 'string') return null
  const questionIds = asStringArray(record['questionIds'])
  if (questionIds.length === 0) return null

  const questionOrderRaw = asStringArray(record['questionOrder'])
  const questionOrder = questionOrderRaw.length > 0 ? questionOrderRaw : questionIds
  const currentIndexRaw = typeof record['currentIndex'] === 'number' ? record['currentIndex'] : 0
  const currentIndex = Math.min(Math.max(0, Math.floor(currentIndexRaw)), questionIds.length - 1)

  return {
    id: record['id'],
    config: normalizeConfig(record['config']),
    status: record['status'] === 'submitted' ? 'submitted' : 'in-progress',
    startedAt: typeof record['startedAt'] === 'string' ? record['startedAt'] : new Date().toISOString(),
    submittedAt: typeof record['submittedAt'] === 'string' ? record['submittedAt'] : null,
    questionIds,
    questionOrder,
    optionOrders: normalizeOptionOrders(record['optionOrders'], questionIds),
    currentIndex,
    answers: normalizeAnswers(record['answers'], questionIds),
    timeLimitSeconds:
      typeof record['timeLimitSeconds'] === 'number' ? record['timeLimitSeconds'] : null,
    deadlineAt: typeof record['deadlineAt'] === 'string' ? record['deadlineAt'] : null,
    elapsedSeconds: typeof record['elapsedSeconds'] === 'number' ? record['elapsedSeconds'] : null,
    totalQuestions:
      typeof record['totalQuestions'] === 'number' ? record['totalQuestions'] : questionIds.length,
    correctCount: typeof record['correctCount'] === 'number' ? record['correctCount'] : null,
    wrongCount: typeof record['wrongCount'] === 'number' ? record['wrongCount'] : null,
    unansweredCount:
      typeof record['unansweredCount'] === 'number' ? record['unansweredCount'] : null,
    score: typeof record['score'] === 'number' ? record['score'] : null,
    scorePercentage:
      typeof record['scorePercentage'] === 'number' ? record['scorePercentage'] : null,
    categoryStats: normalizeCategoryStats(record['categoryStats']),
    questionBankVersion:
      typeof record['questionBankVersion'] === 'string' ? record['questionBankVersion'] : '',
    ruleVersion: typeof record['ruleVersion'] === 'string' ? record['ruleVersion'] : '',
  }
}

export function loadAttempts(): Attempt[] {
  const list = readEnvelope<unknown>(STORAGE_KEYS.attempts, ATTEMPTS_SCHEMA_VERSION, [])
  if (!Array.isArray(list)) return []
  const attempts: Attempt[] = []
  for (const item of list) {
    const attempt = normalizeAttempt(item)
    if (attempt) attempts.push(attempt)
  }
  return attempts
}

export function saveAttempts(attempts: Attempt[]): boolean {
  return writeEnvelope(
    STORAGE_KEYS.attempts,
    ATTEMPTS_SCHEMA_VERSION,
    attempts.slice(0, MAX_STORED_ATTEMPTS),
  )
}

/** Inserts or replaces an attempt (most recent first); a duplicate id is replaced, not duplicated. */
export function saveAttempt(attempt: Attempt): boolean {
  const rest = loadAttempts().filter((item) => item.id !== attempt.id)
  return saveAttempts([attempt, ...rest])
}

export function loadActiveAttempt(): Attempt | null {
  return normalizeAttempt(
    readEnvelope<unknown>(STORAGE_KEYS.activeAttempt, ATTEMPTS_SCHEMA_VERSION, null),
  )
}

export function saveActiveAttempt(attempt: Attempt): boolean {
  return writeEnvelope(STORAGE_KEYS.activeAttempt, ATTEMPTS_SCHEMA_VERSION, attempt)
}

export function clearActiveAttempt(): boolean {
  return removeKey(STORAGE_KEYS.activeAttempt)
}

/* ------------------------------------------------------------------ review */

export function loadReview(): ReviewMap {
  const value = readEnvelope<unknown>(STORAGE_KEYS.review, REVIEW_SCHEMA_VERSION, {})
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: ReviewMap = {}
  for (const [questionId, item] of Object.entries(value as Record<string, unknown>)) {
    if (item === null || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    result[questionId] = {
      questionId,
      firstWrongAt: typeof record['firstWrongAt'] === 'string' ? record['firstWrongAt'] : '',
      lastWrongAt: typeof record['lastWrongAt'] === 'string' ? record['lastWrongAt'] : '',
      wrongCount: typeof record['wrongCount'] === 'number' ? record['wrongCount'] : 0,
      correctCountAfterWrong:
        typeof record['correctCountAfterWrong'] === 'number' ? record['correctCountAfterWrong'] : 0,
      mastered: record['mastered'] === true,
      masteredAt: typeof record['masteredAt'] === 'string' ? record['masteredAt'] : null,
    }
  }
  return result
}

export function saveReview(map: ReviewMap): boolean {
  return writeEnvelope(STORAGE_KEYS.review, REVIEW_SCHEMA_VERSION, map)
}

/* ------------------------------------------------------------------ clears */

export function clearAttempts(): boolean {
  return [removeKey(STORAGE_KEYS.attempts), removeKey(STORAGE_KEYS.activeAttempt)].every(Boolean)
}

export function clearReview(): boolean {
  return removeKey(STORAGE_KEYS.review)
}

export function clearAllData(): boolean {
  return [
    removeKey(STORAGE_KEYS.settings),
    removeKey(STORAGE_KEYS.attempts),
    removeKey(STORAGE_KEYS.activeAttempt),
    removeKey(STORAGE_KEYS.review),
    removeKey(STORAGE_KEYS.meta),
  ].every(Boolean)
}

/* -------------------------------------------------------------- migrations */

const CURRENT_VERSIONS: Record<string, number> = {
  [STORAGE_KEYS.settings]: SETTINGS_SCHEMA_VERSION,
  [STORAGE_KEYS.attempts]: ATTEMPTS_SCHEMA_VERSION,
  [STORAGE_KEYS.activeAttempt]: ATTEMPTS_SCHEMA_VERSION,
  [STORAGE_KEYS.review]: REVIEW_SCHEMA_VERSION,
  [STORAGE_KEYS.meta]: META_SCHEMA_VERSION,
}

export interface MigrationReport {
  migrated: string[]
  recovered: string[]
}

/**
 * Upgrades stored envelopes to the current schema version. Data from a newer
 * app version cannot be downgraded safely: the raw value is preserved under
 * `${key}:recovered` and the key is reset.
 */
export function runMigrations(): MigrationReport {
  const migrated: string[] = []
  const recovered: string[] = []

  for (const [key, currentVersion] of Object.entries(CURRENT_VERSIONS)) {
    const raw = readJSON<unknown>(key, null)
    if (raw === null || typeof raw !== 'object') continue
    const envelope = raw as { schemaVersion?: unknown; data?: unknown }
    if (typeof envelope.schemaVersion !== 'number') continue
    const version = envelope.schemaVersion
    if (version === currentVersion) continue

    if (version < currentVersion) {
      if (writeJSON(key, { schemaVersion: currentVersion, data: envelope.data })) migrated.push(key)
    } else {
      writeJSON(`${key}:recovered`, raw)
      removeKey(key)
      recovered.push(key)
      reportStorageError(
        'version-incompatible',
        'Data was created by a newer version; a backup was kept',
        key,
      )
    }
  }

  if (migrated.length > 0 || recovered.length > 0) {
    saveMeta({ lastMigrationAt: new Date().toISOString() })
  }
  return { migrated, recovered }
}

/* ------------------------------------------------------------------ export */

export interface ExportBundle {
  app: 'badminton-quiz'
  schemaVersion: number
  exportedAt: string
  settings: Settings
  attempts: Attempt[]
  review: ReviewMap
  meta: Meta
}

export function exportData(): string {
  const bundle: ExportBundle = {
    app: 'badminton-quiz',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    settings: loadSettings(),
    attempts: loadAttempts(),
    review: loadReview(),
    meta: loadMeta(),
  }
  return JSON.stringify(bundle, null, 2)
}
