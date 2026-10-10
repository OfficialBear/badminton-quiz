import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { HistoryPage } from '@/pages/HistoryPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PracticePage } from '@/pages/PracticePage'
import { QuizPage } from '@/pages/QuizPage'
import { ResultsPage } from '@/pages/ResultsPage'
import { ReviewPage } from '@/pages/ReviewPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ROUTES } from './paths'

/**
 * Route table shared by the hash router (production) and the memory router
 * (tests) so both exercise identical routing behaviour.
 */
export const appRoutes: RouteObject[] = [
  {
    path: '/quiz/:attemptId',
    element: <QuizPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'practice', element: <PracticePage /> },
      { path: 'quiz/setup', element: <Navigate to={ROUTES.practice} replace /> },
      { path: 'results/:attemptId', element: <ResultsPage /> },
      { path: 'review', element: <ReviewPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
