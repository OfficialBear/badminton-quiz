import type { CategoryId, Difficulty, QuestionType } from '@/types/quiz'

export const TARGET_TOTAL = 100

export const TARGET_BY_CATEGORY: Record<CategoryId, number> = {
  scoring: 20,
  service: 20,
  court: 15,
  faults: 20,
  officials: 15,
  scenario: 10,
}

export const TARGET_BY_TYPE: Record<QuestionType, number> = {
  'true-false': 30,
  single: 40,
  multiple: 20,
  scenario: 10,
}

export const TARGET_BY_DIFFICULTY: Record<Difficulty, number> = {
  basic: 40,
  intermediate: 40,
  expert: 20,
}
