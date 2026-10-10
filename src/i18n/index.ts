import { en } from './locales/en'
import { zh } from './locales/zh'
import type { Language } from '../types/common'

export { zh, en }
export type { Language }

/** Translation keys are derived from the Chinese source of truth (zh.ts). */
export type MessageKey = keyof typeof zh

export const DEFAULT_LANGUAGE: Language = 'zh'

/**
 * Compile-time parity guard: `en` must define every key that `zh` defines.
 * A missing key becomes a type error here.
 */
export const enParityCheck: Record<MessageKey, string> = en

const dictionaries: Record<Language, Record<MessageKey, string>> = { zh, en }

export type TranslationParams = Record<string, string | number>

export function translate(language: Language, key: MessageKey, params?: TranslationParams): string {
  const dictionary = dictionaries[language] ?? dictionaries[DEFAULT_LANGUAGE]
  const template = dictionary[key]
  if (typeof template !== 'string') {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] missing translation for key: ${String(key)}`)
    }
    return String(key)
  }
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => {
    const value = params[name]
    return value === undefined ? '' : String(value)
  })
}

export function checkTranslationParity(): { missingInEn: string[]; missingInZh: string[] } {
  const zhKeys = new Set(Object.keys(zh))
  const enKeys = new Set(Object.keys(en))
  const missingInEn = [...zhKeys].filter((key) => !enKeys.has(key))
  const missingInZh = [...enKeys].filter((key) => !zhKeys.has(key))
  return { missingInEn, missingInZh }
}

/**
 * Development-only guard: reports translation keys missing from either locale.
 * Never throws and is a no-op in production builds.
 */
export function runDevTranslationCheck(): void {
  if (!import.meta.env.DEV) return
  const { missingInEn, missingInZh } = checkTranslationParity()
  if (missingInEn.length > 0) {
    console.error('[i18n] keys missing from en:', missingInEn)
  }
  if (missingInZh.length > 0) {
    console.error('[i18n] keys missing from zh:', missingInZh)
  }
}

runDevTranslationCheck()
