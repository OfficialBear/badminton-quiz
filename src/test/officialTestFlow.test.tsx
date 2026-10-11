import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { zh } from '@/i18n'
import { QUESTION_BANK } from '@/data/questionBank'
import {
  OFFICIAL_TEST_STORAGE_KEY,
  createTestState,
  submitTest,
} from '@/services/officialTestService'

describe('official test flow', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    window.localStorage.clear()
  })

  it('redirects direct /test/paper access to the test intro page', async () => {
    renderApp(['/test/paper'])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['test.title'])
  })

  it('redirects /test/results to the intro when nothing was submitted', () => {
    renderApp(['/test/results'])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['test.title'])
  })

  it('requires a nickname before starting', async () => {
    const user = userEvent.setup()
    renderApp(['/test'])
    await user.click(screen.getByRole('button', { name: zh['test.start'] }))
    expect(await screen.findByText(zh['test.nickname.required'])).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['test.title'])
  })

  it('starts the fixed 50-question paper after entering a nickname', async () => {
    const user = userEvent.setup()
    renderApp(['/test'])
    expect(screen.getByText(zh['test.scoring'])).toBeInTheDocument()
    await user.type(screen.getByLabelText(zh['test.nickname.label']), '小明')
    await user.click(screen.getByRole('button', { name: zh['test.start'] }))
    await waitFor(() => expect(screen.getByText(/第 1 \/ 50 题/)).toBeInTheDocument())
    expect(screen.getByText('小明')).toBeInTheDocument()
  })

  it('shows the score out of 100 on the results page', async () => {
    const state = createTestState('小明')
    if (!state) throw new Error('expected state')
    const first = state.questionIds[0]
    if (!first) throw new Error('expected a question id')
    const question = QUESTION_BANK.find((item) => item.id === first)
    if (!question) throw new Error('expected question in bank')
    const submitted = submitTest({ ...state, answers: { [first]: [...question.correctOptionIds] } })
    window.sessionStorage.setItem(OFFICIAL_TEST_STORAGE_KEY, JSON.stringify(submitted))

    renderApp(['/test/results'])
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['test.results.title']),
    )
    expect(screen.getByText(zh['test.results.score'])).toBeInTheDocument()
    expect(screen.getByText('/ 100')).toBeInTheDocument()
  })

  it('renders the results page without the top navigation bar', async () => {
    const state = createTestState('小明')
    if (!state) throw new Error('expected state')
    window.sessionStorage.setItem(OFFICIAL_TEST_STORAGE_KEY, JSON.stringify(submitTest(state)))

    renderApp(['/test/results'])
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['test.results.title']),
    )
    expect(document.querySelector('header')).toBeNull()
  })

  it('restores nickname, answers and question index after a reload', async () => {
    const user = userEvent.setup()
    const first = renderApp(['/test'])
    await user.type(screen.getByLabelText(zh['test.nickname.label']), '小明')
    await user.click(screen.getByRole('button', { name: zh['test.start'] }))
    await waitFor(() => expect(screen.getByText(/第 1 \/ 50 题/)).toBeInTheDocument())

    const firstOption = document.querySelector<HTMLInputElement>(
      'input[type="radio"], input[type="checkbox"]',
    )
    await user.click(firstOption?.closest('label') as HTMLElement)
    await user.click(screen.getByRole('button', { name: zh['quiz.next'] }))
    await waitFor(() => expect(screen.getByText(/第 2 \/ 50 题/)).toBeInTheDocument())
    first.unmount()

    renderApp(['/test/paper'])
    expect(await screen.findByText(/第 2 \/ 50 题/)).toBeInTheDocument()
    expect(screen.getByText('小明')).toBeInTheDocument()
  })

  it('filters the review into correct and incorrect sets', async () => {
    const user = userEvent.setup()
    const state = createTestState('小明')
    if (!state) throw new Error('expected state')
    const [firstId, secondId] = state.questionIds
    if (!firstId || !secondId) throw new Error('expected two question ids')
    const rightQuestion = QUESTION_BANK.find((item) => item.id === firstId)
    const wrongQuestion = QUESTION_BANK.find((item) => item.id === secondId)
    if (!rightQuestion || !wrongQuestion) throw new Error('expected questions in bank')
    const wrongOption = wrongQuestion.options.find(
      (option) => !wrongQuestion.correctOptionIds.includes(option.id),
    )
    if (!wrongOption) throw new Error('expected a wrong option')
    const submitted = submitTest({
      ...state,
      answers: {
        [firstId]: [...rightQuestion.correctOptionIds],
        [secondId]: [wrongOption.id],
      },
    })
    window.sessionStorage.setItem(OFFICIAL_TEST_STORAGE_KEY, JSON.stringify(submitted))

    renderApp(['/test/results'])
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['test.results.title']),
    )
    expect(screen.getByText(rightQuestion.question.zh)).toBeInTheDocument()
    expect(screen.getByText(wrongQuestion.question.zh)).toBeInTheDocument()

    await user.click(screen.getByText(`${zh['test.results.filter.correct']} (1)`))
    expect(screen.getByText(rightQuestion.question.zh)).toBeInTheDocument()
    expect(screen.queryByText(wrongQuestion.question.zh)).toBeNull()

    await user.click(screen.getByText(`${zh['test.results.filter.wrong']} (49)`))
    expect(screen.queryByText(rightQuestion.question.zh)).toBeNull()
    expect(screen.getByText(wrongQuestion.question.zh)).toBeInTheDocument()
  })

  it('auto-submits when the 45-minute deadline has passed', async () => {
    const state = createTestState('小明')
    if (!state) throw new Error('expected state')
    window.sessionStorage.setItem(
      OFFICIAL_TEST_STORAGE_KEY,
      JSON.stringify({ ...state, deadlineAt: new Date(Date.now() - 1000).toISOString() }),
    )

    renderApp(['/test/paper'])

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['test.results.title']),
    )
    expect(screen.getByText(zh['test.results.timedOut'])).toBeInTheDocument()
  })
})
