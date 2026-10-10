import { createHashRouter, RouterProvider } from 'react-router-dom'
import { appRoutes } from './routes'

/**
 * HashRouter keeps GitHub Pages project-site deep links working when the page
 * is refreshed directly (everything after `#` never reaches the server).
 */
const router = createHashRouter(appRoutes)

export function AppRouter() {
  return <RouterProvider router={router} />
}
