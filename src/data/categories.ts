import type { MessageKey } from '@/i18n'
import type { CategoryId, Difficulty, QuestionType } from '@/types/quiz'

export interface CategoryMeta {
  id: CategoryId
  labelKey: MessageKey
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'scoring', labelKey: 'topics.scoring' },
  { id: 'service', labelKey: 'topics.service' },
  { id: 'court', labelKey: 'topics.court' },
  { id: 'faults', labelKey: 'topics.faults' },
  { id: 'officials', labelKey: 'topics.officials' },
  { id: 'scenario', labelKey: 'topics.scenario' },
]

export const DIFFICULTIES: { id: Difficulty; labelKey: MessageKey }[] = [
  { id: 'basic', labelKey: 'difficulty.basic' },
  { id: 'intermediate', labelKey: 'difficulty.intermediate' },
  { id: 'expert', labelKey: 'difficulty.expert' },
]

export const QUESTION_TYPES: { id: QuestionType; labelKey: MessageKey }[] = [
  { id: 'true-false', labelKey: 'type.trueFalse' },
  { id: 'single', labelKey: 'type.single' },
  { id: 'multiple', labelKey: 'type.multiple' },
  { id: 'scenario', labelKey: 'type.scenario' },
]

export function categoryLabelKey(id: CategoryId): MessageKey {
  return CATEGORIES.find((category) => category.id === id)?.labelKey ?? 'topics.scoring'
}

export function difficultyLabelKey(id: Difficulty): MessageKey {
  return DIFFICULTIES.find((difficulty) => difficulty.id === id)?.labelKey ?? 'difficulty.basic'
}

export function questionTypeLabelKey(id: QuestionType): MessageKey {
  return QUESTION_TYPES.find((type) => type.id === id)?.labelKey ?? 'type.single'
}
