export interface ReviewItem {
  questionId: string
  firstWrongAt: string
  lastWrongAt: string
  wrongCount: number
  correctCountAfterWrong: number
  mastered: boolean
  masteredAt: string | null
}

export type ReviewMap = Record<string, ReviewItem>
