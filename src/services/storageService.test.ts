import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  isStorageAvailable,
  loadSettings,
  readJSON,
  saveSettings,
  writeJSON,
} from '@/services/storageService'

describe('storageService', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('reports storage as available in jsdom', () => {
    expect(isStorageAvailable()).toBe(true)
  })

  it('returns default settings when nothing is stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('falls back to defaults on corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEYS.settings, '{not valid json')
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('rejects out-of-range stored values', () => {
    window.localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ language: 'fr', theme: 'neon' }),
    )
    const settings = loadSettings()
    expect(settings.language).toBe('zh')
    expect(settings.theme).toBe('system')
  })

  it('merges a patch on save and persists it', () => {
    expect(saveSettings({ language: 'en' })).toBe(true)
    const settings = loadSettings()
    expect(settings.language).toBe('en')
    expect(settings.theme).toBe('system')
    expect(settings.schemaVersion).toBe(DEFAULT_SETTINGS.schemaVersion)
  })

  it('does not overwrite the other field when patching one', () => {
    saveSettings({ theme: 'dark' })
    saveSettings({ language: 'en' })
    const settings = loadSettings()
    expect(settings.theme).toBe('dark')
    expect(settings.language).toBe('en')
  })

  it('readJSON returns the fallback for corrupt data', () => {
    window.localStorage.setItem('badminton-quiz:meta', 'not-json')
    expect(readJSON('badminton-quiz:meta', { ok: true })).toEqual({ ok: true })
  })

  it('writeJSON round-trips a value', () => {
    expect(writeJSON('badminton-quiz:meta', { a: 1 })).toBe(true)
    expect(readJSON('badminton-quiz:meta', null)).toEqual({ a: 1 })
  })
})
