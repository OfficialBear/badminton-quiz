import type { Question, QuestionType } from '@/types/quiz'
import {
  TARGET_BY_CATEGORY,
  TARGET_BY_DIFFICULTY,
  TARGET_BY_TYPE,
  TARGET_TOTAL,
} from '@/data/bankTargets'
import { CATEGORIES, DIFFICULTIES, QUESTION_TYPES } from '@/data/categories'

export type IssueLevel = 'error' | 'warning'

export interface ValidationIssue {
  code: string
  level: IssueLevel
  message: string
  questionId?: string
}

export interface BankDistribution {
  total: number
  byCategory: Record<string, number>
  byType: Record<string, number>
  byDifficulty: Record<string, number>
  verified: number
  draft: number
  needsReview: number
}

export interface BankValidationReport {
  ok: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  distribution: BankDistribution
}

export interface ValidateOptions {
  /** When true, any non-verified question is an error (official bank rule). */
  requireVerified?: boolean
  /** Compare counts against the target distribution (warnings only). */
  checkDistribution?: boolean
}

const VALID_STATUSES = new Set(['draft', 'needs-review', 'verified'])
const ONE_ANSWER_TYPES: QuestionType[] = ['true-false', 'single']

function text(value: { zh?: string; en?: string } | undefined): boolean {
  return typeof value?.zh === 'string' && value.zh.trim() !== '' &&
    typeof value.en === 'string' && value.en.trim() !== ''
}

export function validateQuestionBank(
  bank: Question[],
  options: ValidateOptions = {},
): BankValidationReport {
  const { requireVerified = false, checkDistribution = true } = options
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  const push = (list: ValidationIssue[], code: string, message: string, questionId?: string) =>
    list.push({ code, level: list === errors ? 'error' : 'warning', message, questionId })

  const seenIds = new Set<string>()

  for (const question of bank) {
    const id = question.id
    if (seenIds.has(id)) push(errors, 'duplicate-question-id', `Duplicate question id: ${id}`, id)
    seenIds.add(id)

    if (!CATEGORIES.some((category) => category.id === question.category)) {
      push(errors, 'invalid-category', `Unknown category: ${String(question.category)}`, id)
    }
    if (!QUESTION_TYPES.some((type) => type.id === question.type)) {
      push(errors, 'invalid-type', `Unknown question type: ${String(question.type)}`, id)
    }
    if (!DIFFICULTIES.some((difficulty) => difficulty.id === question.difficulty)) {
      push(errors, 'invalid-difficulty', `Unknown difficulty: ${String(question.difficulty)}`, id)
    }
    if (!VALID_STATUSES.has(question.reviewStatus)) {
      push(errors, 'invalid-review-status', `Unknown review status`, id)
    }

    if (!text(question.question)) push(errors, 'missing-question-text', 'Missing zh/en question text', id)
    if (!text(question.explanation)) push(errors, 'missing-explanation', 'Missing zh/en explanation', id)

    if (!question.ruleReference || question.ruleReference.trim() === '') {
      push(errors, 'missing-rule-reference', 'Missing rule reference', id)
    }
    if (!question.ruleClause || question.ruleClause.trim() === '') {
      push(errors, 'missing-rule-clause', 'Missing rule clause / locator', id)
    }
    if (!question.ruleVersion || question.ruleVersion.trim() === '') {
      push(errors, 'missing-rule-version', 'Missing rule version', id)
    }

    if (question.options.length < 2) {
      push(errors, 'too-few-options', 'Question must have at least two options', id)
    }

    const optionIds = new Set<string>()
    for (const option of question.options) {
      if (optionIds.has(option.id)) {
        push(errors, 'duplicate-option-id', `Duplicate option id: ${option.id}`, id)
      }
      optionIds.add(option.id)
      if (!text(option.text)) {
        push(errors, 'missing-option-text', `Missing zh/en text for option ${option.id}`, id)
      }
    }

    const answers = question.correctOptionIds
    if (answers.length === 0) {
      push(errors, 'empty-answer', 'Has no correct option ids', id)
    }
    if (ONE_ANSWER_TYPES.includes(question.type) && answers.length !== 1) {
      push(errors, 'invalid-answer-count', `${question.type} must have exactly one correct option`, id)
    }
    for (const answerId of answers) {
      if (!optionIds.has(answerId)) {
        push(errors, 'answer-references-missing-option', `Correct answer ${answerId} is not an option`, id)
      }
    }

    if (question.tags.length === 0) {
      push(warnings, 'missing-tags', 'No knowledge tags', id)
    }

    if (requireVerified && question.reviewStatus !== 'verified') {
      push(errors, 'unverified-in-bank', `Non-verified question in official bank`, id)
    }
  }

  const distribution = buildDistribution(bank)

  if (checkDistribution) {
    if (distribution.total !== TARGET_TOTAL) {
      push(
        warnings,
        'total-count-mismatch',
        `Bank has ${distribution.total} questions; target is ${TARGET_TOTAL}`,
      )
    }
    for (const category of CATEGORIES) {
      const actual = distribution.byCategory[category.id] ?? 0
      const target = TARGET_BY_CATEGORY[category.id]
      if (actual !== target) {
        push(warnings, 'category-distribution-mismatch', `${category.id}: ${actual}/${target}`)
      }
    }
    for (const type of QUESTION_TYPES) {
      const actual = distribution.byType[type.id] ?? 0
      const target = TARGET_BY_TYPE[type.id]
      if (actual !== target) {
        push(warnings, 'type-distribution-mismatch', `${type.id}: ${actual}/${target}`)
      }
    }
    for (const difficulty of DIFFICULTIES) {
      const actual = distribution.byDifficulty[difficulty.id] ?? 0
      const target = TARGET_BY_DIFFICULTY[difficulty.id]
      if (actual !== target) {
        push(warnings, 'difficulty-distribution-mismatch', `${difficulty.id}: ${actual}/${target}`)
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings, distribution }
}

export function buildDistribution(bank: Question[]): BankDistribution {
  const byCategory: Record<string, number> = {}
  const byType: Record<string, number> = {}
  const byDifficulty: Record<string, number> = {}
  for (const category of CATEGORIES) byCategory[category.id] = 0
  for (const type of QUESTION_TYPES) byType[type.id] = 0
  for (const difficulty of DIFFICULTIES) byDifficulty[difficulty.id] = 0

  let verified = 0
  let draft = 0
  let needsReview = 0

  for (const question of bank) {
    byCategory[question.category] = (byCategory[question.category] ?? 0) + 1
    byType[question.type] = (byType[question.type] ?? 0) + 1
    byDifficulty[question.difficulty] = (byDifficulty[question.difficulty] ?? 0) + 1
    if (question.reviewStatus === 'verified') verified += 1
    else if (question.reviewStatus === 'needs-review') needsReview += 1
    else draft += 1
  }

  return { total: bank.length, byCategory, byType, byDifficulty, verified, draft, needsReview }
}

export function listUnverified(bank: Question[]): Question[] {
  return bank.filter((question) => question.reviewStatus !== 'verified')
}
