import type { Question } from '@/types/quiz'
import { SCORING_QUESTIONS } from './bank/scoring'
import { SERVICE_QUESTIONS } from './bank/service'
import { COURT_QUESTIONS } from './bank/court'
import { FAULT_QUESTIONS } from './bank/faults'
import { OFFICIAL_QUESTIONS } from './bank/officials'
import { SCENARIO_QUESTIONS } from './bank/scenario'

/**
 * Question bank (100 unique questions) authored against the official
 * "BWF Statutes, Section 4.1 — Laws of Badminton" (docs/SECTION 4.1- Laws of Badminton.pdf).
 *
 * Status: all items are `reviewStatus: 'verified'` (approved for use) per an
 * explicit product decision. NOTE: this flag means "approved to use in the app";
 * it is NOT a record of human rule-by-rule review. Each question carries a
 * `ruleClause` for traceability, and docs/question-bank-review.md describes the
 * manual verification process for long-term maintenance.
 */
export const QUESTION_BANK_VERSION = '1.0.0'
export const RULE_VERSION = 'BWF Statutes, Section 4.1'

export const QUESTION_BANK: Question[] = [
  ...SCORING_QUESTIONS,
  ...SERVICE_QUESTIONS,
  ...COURT_QUESTIONS,
  ...FAULT_QUESTIONS,
  ...OFFICIAL_QUESTIONS,
  ...SCENARIO_QUESTIONS,
]
