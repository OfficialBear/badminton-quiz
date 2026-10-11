import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { I18nProvider } from '@/i18n/I18nProvider'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { TooltipProvider } from '@/components/shadcn/tooltip'
import { appRoutes } from '@/router/routes'

export function renderApp(initialEntries: string[] = ['/']) {
  const router = createMemoryRouter(appRoutes, { initialEntries })
  return render(
    <I18nProvider initialLanguage="zh">
      <ThemeProvider>
        <TooltipProvider delayDuration={200}>
          <RouterProvider router={router} />
        </TooltipProvider>
      </ThemeProvider>
    </I18nProvider>,
  )
}
