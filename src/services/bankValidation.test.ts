import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/quiz'
import { QUESTION_BANK } from '@/data/questionBank'
import { buildDistribution, validateQuestionBank } from '@/services/bankValidation'

function validQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    category: 'scoring',
    type: 'single',
    difficulty: 'basic',
    question: { zh: '题干', en: 'prompt' },
    options: [
      { id: 'a', text: { zh: 'A', en: 'A' } },
      { id: 'b', text: { zh: 'B', en: 'B' } },
    ],
    correctOptionIds: ['a'],
    explanation: { zh: '解析', en: 'explanation' },
    ruleReference: 'BWF Laws of Badminton',
    ruleClause: 'Laws 7.1',
    ruleVersion: '2024',
    reviewStatus: 'verified',
    tags: ['scoring'],
    ...overrides,
  }
}

describe('bankValidation', () => {
  it('passes a structurally valid bank', () => {
    const report = validateQuestionBank([validQuestion()], { checkDistribution: false })
    expect(report.ok).toBe(true)
    expect(report.errors).toHaveLength(0)
  })

  it('flags duplicate question ids', () => {
    const report = validateQuestionBank([validQuestion(), validQuestion()], {
      checkDistribution: false,
    })
    expect(report.ok).toBe(false)
    expect(report.errors.some((error) => error.code === 'duplicate-question-id')).toBe(true)
  })

  it('flags duplicate option ids and answers referencing missing options', () => {
    const report = validateQuestionBank(
      [
        validQuestion({
          options: [
            { id: 'a', text: { zh: 'A', en: 'A' } },
            { id: 'a', text: { zh: 'B', en: 'B' } },
          ],
          correctOptionIds: ['x'],
        }),
      ],
      { checkDistribution: false },
    )
    const codes = report.errors.map((error) => error.code)
    expect(codes).toContain('duplicate-option-id')
    expect(codes).toContain('answer-references-missing-option')
  })

  it('enforces answer structure per question type', () => {
    const report = validateQuestionBank(
      [
        validQuestion({ id: 'a', type: 'true-false', correctOptionIds: ['a', 'b'] }),
        validQuestion({ id: 'b', type: 'multiple', correctOptionIds: [] }),
      ],
      { checkDistribution: false },
    )
    const invalidCounts = report.errors.filter((error) => error.code === 'invalid-answer-count')
    expect(invalidCounts).toHaveLength(1)
    expect(report.errors.some((error) => error.code === 'empty-answer')).toBe(true)
  })

  it('flags missing bilingual content, source and version', () => {
    const report = validateQuestionBank(
      [
        validQuestion({
          id: 'x',
          question: { zh: '题干', en: '' },
          ruleReference: '',
          ruleClause: '',
          ruleVersion: '',
        }),
      ],
      { checkDistribution: false },
    )
    const codes = report.errors.map((error) => error.code)
    expect(codes).toContain('missing-question-text')
    expect(codes).toContain('missing-rule-reference')
    expect(codes).toContain('missing-rule-clause')
    expect(codes).toContain('missing-rule-version')
  })

  it('rejects unverified questions in an official bank when required', () => {
    const report = validateQuestionBank([validQuestion({ reviewStatus: 'draft' })], {
      requireVerified: true,
      checkDistribution: false,
    })
    expect(report.errors.some((error) => error.code === 'unverified-in-bank')).toBe(true)
  })

  it('reports distribution against targets as warnings only', () => {
    const report = validateQuestionBank([validQuestion()], { checkDistribution: true })
    expect(report.ok).toBe(true)
    expect(report.warnings.some((warning) => warning.code === 'total-count-mismatch')).toBe(true)
    expect(report.distribution.total).toBe(1)
    expect(report.distribution.byType['single']).toBe(1)
  })

  it('summarizes the current bank: 100 verified, target distribution met', () => {
    const distribution = buildDistribution(QUESTION_BANK)
    expect(distribution.total).toBe(100)
    expect(distribution.draft).toBe(0)
    expect(distribution.verified).toBe(100)
    const report = validateQuestionBank(QUESTION_BANK, { checkDistribution: true })
    expect(report.ok).toBe(true)
    expect(report.errors).toEqual([])
    expect(report.warnings).toEqual([])
    const gate = validateQuestionBank(QUESTION_BANK, { requireVerified: true })
    expect(gate.errors).toEqual([])
  })

  it('keeps Chinese and English content in their own language', () => {
    const cjk = /[\u4e00-\u9fff]/
    for (const question of QUESTION_BANK) {
      expect(cjk.test(question.question.zh), `${question.id}:question.zh`).toBe(true)
      expect(cjk.test(question.question.en), `${question.id}:question.en`).toBe(false)
      expect(cjk.test(question.explanation.zh), `${question.id}:explanation.zh`).toBe(true)
      expect(cjk.test(question.explanation.en), `${question.id}:explanation.en`).toBe(false)
      for (const option of question.options) {
        expect(cjk.test(option.text.zh), `${question.id}:${option.id}.zh`).toBe(true)
        expect(cjk.test(option.text.en), `${question.id}:${option.id}.en`).toBe(false)
      }
    }
  })

  it('current bank questions all have complete Chinese and English content', () => {
    const report = validateQuestionBank(QUESTION_BANK, { checkDistribution: false })
    const bilingualCodes = [
      'missing-question-text',
      'missing-explanation',
      'missing-option-text',
    ]
    const missing = report.errors.filter((error) => bilingualCodes.includes(error.code))
    expect(missing).toEqual([])
  })
})
