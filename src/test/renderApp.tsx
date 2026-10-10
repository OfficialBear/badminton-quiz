import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { I18nProvider } from '@/i18n/I18nProvider'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { appRoutes } from '@/router/routes'

/** Renders the real route table inside the real providers using a memory router. */
export function renderApp(initialEntries: string[] = ['/']) {
  const router = createMemoryRouter(appRoutes, { initialEntries })
  return render(
    <I18nProvider initialLanguage="zh">
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </I18nProvider>,
  )
}
