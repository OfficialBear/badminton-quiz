import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { en, zh } from '@/i18n'

describe('routing', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the home page at "/"', () => {
    renderApp(['/'])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['home.title'])
  })

  it('renders the practice page', () => {
    renderApp(['/practice'])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['practice.title'])
  })

  it('redirects the legacy /quiz/setup route to practice', () => {
    renderApp(['/quiz/setup'])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['practice.title'])
  })

  it('renders the settings page', () => {
    renderApp(['/settings'])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['settings.title'])
  })

  it('renders the history empty state', () => {
    renderApp(['/history'])
    expect(screen.getByText(zh['history.empty.title'])).toBeInTheDocument()
  })

  it('renders the review empty state', () => {
    renderApp(['/review'])
    expect(screen.getByText(zh['review.empty.title'])).toBeInTheDocument()
  })

  it('renders the not-found page for unknown routes', () => {
    renderApp(['/does-not-exist'])
    expect(screen.getByText(zh['common.notFound.title'])).toBeInTheDocument()
  })

  it('navigates via a navigation link', async () => {
    const user = userEvent.setup()
    renderApp(['/'])
    const target = screen.getAllByRole('link', { name: zh['nav.history'] })[0]
    expect(target).toBeDefined()
    if (target) await user.click(target)
    expect(screen.getByText(zh['history.empty.title'])).toBeInTheDocument()
  })

  it('switches the interface language on the settings page', async () => {
    const user = userEvent.setup()
    renderApp(['/settings'])
    await user.click(screen.getByRole('radio', { name: 'English' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en['settings.title'])
  })
})
