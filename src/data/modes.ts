import type { MessageKey } from '@/i18n'
import type { QuizMode } from '@/types/attempt'

export interface ModeMeta {
  id: QuizMode
  titleKey: MessageKey
  descKey: MessageKey
}

export const MODES: ModeMeta[] = [
  { id: 'practice', titleKey: 'home.modes.practice.title', descKey: 'home.modes.practice.desc' },
  { id: 'exam', titleKey: 'home.modes.exam.title', descKey: 'home.modes.exam.desc' },
  { id: 'topic', titleKey: 'home.modes.topic.title', descKey: 'home.modes.topic.desc' },
  { id: 'wrong', titleKey: 'home.modes.wrong.title', descKey: 'home.modes.wrong.desc' },
]

export function modeLabelKey(id: QuizMode): MessageKey {
  switch (id) {
    case 'practice':
      return 'mode.practice'
    case 'exam':
      return 'mode.exam'
    case 'topic':
      return 'mode.topic'
    case 'wrong':
      return 'mode.wrong'
  }
}
