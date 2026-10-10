import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Language } from '../types/common'
import { loadSettings, saveSettings } from '../services/storageService'
import {
  DEFAULT_LANGUAGE,
  checkTranslationParity,
  translate,
  type MessageKey,
  type TranslationParams,
} from './index'
import { I18nContext, type I18nContextValue } from './I18nContext'

const LANGUAGES: Language[] = ['zh', 'en']

const HTML_LANG: Record<Language, string> = {
  zh: 'zh-Hans',
  en: 'en',
}

function resolveInitialLanguage(initialLanguage?: Language): Language {
  if (initialLanguage) return initialLanguage
  return loadSettings().language ?? DEFAULT_LANGUAGE
}

export interface I18nProviderProps {
  children: ReactNode
  initialLanguage?: Language
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() =>
    resolveInitialLanguage(initialLanguage),
  )

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[language]
  }, [language])

  useEffect(() => {
    if (import.meta.env.DEV) {
      const { missingInEn, missingInZh } = checkTranslationParity()
      if (missingInEn.length > 0 || missingInZh.length > 0) {
        console.error('[i18n] translation parity check failed', { missingInEn, missingInZh })
      }
    }
  }, [])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    saveSettings({ language: next })
  }, [])

  const t = useCallback(
    (key: MessageKey, params?: TranslationParams) => translate(language, key, params),
    [language],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, t, languages: LANGUAGES }),
    [language, setLanguage, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
