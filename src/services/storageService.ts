import type { Language, Theme } from '../types/common'
import type { Attempt } from '../types/attempt'
import type { ReviewMap } from '../types/review'

/**
 * All localStorage keys use the `badminton-quiz:` prefix (design.md 8.2).
 */
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
const MAX_STORED_ATTEMPTS = 100

export interface Settings {
  schemaVersion: number
  language: Language
  theme: Theme
}

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  language: 'zh',
  theme: 'system',
}

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
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function removeKey(key: string): boolean {
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
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
  if (envelope.schemaVersion !== schemaVersion) return fallback
  if (envelope.data === undefined) return fallback
  return envelope.data as T
}

function writeEnvelope<T>(key: string, schemaVersion: number, data: T): boolean {
  const envelope: Envelope<T> = { schemaVersion, data }
  return writeJSON(key, envelope)
}

const LANGUAGES: readonly Language[] = ['zh', 'en']
const THEMES: readonly Theme[] = ['light', 'dark', 'system']

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}

function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

function isAttemptLike(value: unknown): value is Attempt {
  if (value === null || typeof value !== 'object') return false
  const record = value as { id?: unknown; questionIds?: unknown }
  return typeof record.id === 'string' && Array.isArray(record.questionIds)
}

/** Reads settings defensively; corrupt or out-of-range values fall back to defaults. */
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

export function loadAttempts(): Attempt[] {
  const list = readEnvelope<unknown>(STORAGE_KEYS.attempts, ATTEMPTS_SCHEMA_VERSION, [])
  if (!Array.isArray(list)) return []
  return list.filter(isAttemptLike)
}

export function saveAttempts(attempts: Attempt[]): boolean {
  return writeEnvelope(
    STORAGE_KEYS.attempts,
    ATTEMPTS_SCHEMA_VERSION,
    attempts.slice(0, MAX_STORED_ATTEMPTS),
  )
}

/** Inserts or replaces an attempt (most recent first) in the history list. */
export function saveAttempt(attempt: Attempt): boolean {
  const rest = loadAttempts().filter((item) => item.id !== attempt.id)
  return saveAttempts([attempt, ...rest])
}

export function loadActiveAttempt(): Attempt | null {
  const value = readEnvelope<unknown>(STORAGE_KEYS.activeAttempt, ATTEMPTS_SCHEMA_VERSION, null)
  return isAttemptLike(value) ? value : null
}

export function saveActiveAttempt(attempt: Attempt): boolean {
  return writeEnvelope(STORAGE_KEYS.activeAttempt, ATTEMPTS_SCHEMA_VERSION, attempt)
}

export function clearActiveAttempt(): boolean {
  return removeKey(STORAGE_KEYS.activeAttempt)
}

export function loadReview(): ReviewMap {
  const value = readEnvelope<unknown>(STORAGE_KEYS.review, REVIEW_SCHEMA_VERSION, {})
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as ReviewMap
}

export function saveReview(map: ReviewMap): boolean {
  return writeEnvelope(STORAGE_KEYS.review, REVIEW_SCHEMA_VERSION, map)
}

export function clearAttempts(): boolean {
  return removeKey(STORAGE_KEYS.attempts) && removeKey(STORAGE_KEYS.activeAttempt)
}

export function clearReview(): boolean {
  return removeKey(STORAGE_KEYS.review)
}

export interface ExportBundle {
  app: 'badminton-quiz'
  schemaVersion: number
  exportedAt: string
  settings: Settings
  attempts: Attempt[]
  review: ReviewMap
}

export function exportData(): string {
  const bundle: ExportBundle = {
    app: 'badminton-quiz',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    settings: loadSettings(),
    attempts: loadAttempts(),
    review: loadReview(),
  }
  return JSON.stringify(bundle, null, 2)
}
