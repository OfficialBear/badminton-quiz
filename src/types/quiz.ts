import type { Language } from './common'

export type CategoryId = 'scoring' | 'service' | 'court' | 'faults' | 'officials' | 'scenario'

export type Difficulty = 'basic' | 'intermediate' | 'expert'

export type QuestionType = 'true-false' | 'single' | 'multiple' | 'scenario'

/**
 * Content review state. Only `verified` questions belong to the official bank;
 * `draft`/`needs-review` items must never be presented as validated rules.
 */
export type ReviewStatus = 'draft' | 'needs-review' | 'verified'

export interface LocalizedText {
  zh: string
  en: string
}

export interface QuestionOption {
  id: string
  text: LocalizedText
}

export interface Question {
  id: string
  category: CategoryId
  type: QuestionType
  difficulty: Difficulty
  question: LocalizedText
  options: QuestionOption[]
  correctOptionIds: string[]
  explanation: LocalizedText
  /** Official source, e.g. "BWF Laws of Badminton". */
  ruleReference: string
  /** Clause / locatable reference inside the source, e.g. "Laws 7.1". */
  ruleClause: string
  /** Rule document version / effective date; "pending" until verified. */
  ruleVersion: string
  reviewStatus: ReviewStatus
  tags: string[]
}

export function localizedText(text: LocalizedText, language: Language): string {
  return language === 'zh' ? text.zh : text.en
}
