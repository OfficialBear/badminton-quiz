import { createContext, useContext } from 'react'
import type { Language } from '../types/common'
import type { MessageKey, TranslationParams } from './index'

export interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: MessageKey, params?: TranslationParams) => string
  languages: Language[]
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
