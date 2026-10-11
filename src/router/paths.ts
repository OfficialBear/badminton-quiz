export const ROUTES = {
  home: '/',
  practice: '/practice',
  quiz: '/quiz/:attemptId',
  results: '/results/:attemptId',
  review: '/review',
  history: '/history',
  settings: '/settings',
  legacySetup: '/quiz/setup',
  test: '/test',
  testPaper: '/test/paper',
  testResults: '/test/results',
} as const

export interface PracticePathParams {
  mode?: string
  topic?: string
}

export function practicePath(params: PracticePathParams = {}): string {
  const search = new URLSearchParams()
  if (params.mode) search.set('mode', params.mode)
  if (params.topic) search.set('topic', params.topic)
  const query = search.toString()
  return query ? `${ROUTES.practice}?${query}` : ROUTES.practice
}

export function quizPath(attemptId: string): string {
  return `/quiz/${encodeURIComponent(attemptId)}`
}

export function resultsPath(attemptId: string): string {
  return `/results/${encodeURIComponent(attemptId)}`
}
