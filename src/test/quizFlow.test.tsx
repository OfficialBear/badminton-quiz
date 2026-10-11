import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/renderApp'
import { zh } from '@/i18n'
import { QUESTION_BANK } from '@/data/questionBank'
import { DEFAULT_CONFIG, createAttemptFromQuestions } from '@/services/quizService'
import { saveActiveAttempt, saveAttempt } from '@/services/storageService'
import type { Question } from '@/types/quiz'
import type { QuizMode } from '@/types/attempt'

function singleQuestions(count: number): Question[] {
  const found = QUESTION_BANK.filter((question) => question.type === 'single').slice(0, count)
  if (found.length < count) throw new Error('not enough single-choice questions in the bank')
  return found
}

function seedAttempt(questions: Question[], mode: QuizMode = 'practice') {
  const attempt = createAttemptFromQuestions(
    { ...DEFAULT_CONFIG, mode, questionCount: questions.length, randomizeQuestions: false },
    questions,
  )
  if (!attempt) throw new Error('expected an attempt')
  saveAttempt(attempt)
  saveActiveAttempt(attempt)
  return attempt
}

function optionInputs(): HTMLInputElement[] {
  const first = document.querySelector<HTMLInputElement>(
    'input[type="radio"], input[type="checkbox"]',
  )
  if (!first) return []
  const name = first.getAttribute('name')
  return Array.from(document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`))
}

describe('quiz flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('completes answer → submit → results', async () => {
    const user = userEvent.setup()
    const attempt = seedAttempt(singleQuestions(1))
    renderApp([`/quiz/${attempt.id}`])

    await waitFor(() => expect(optionInputs().length).toBeGreaterThan(0))
    await user.click(optionInputs()[0]!.closest('label') as HTMLElement)
    await user.click(screen.getByRole('button', { name: zh['quiz.submit'] }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: zh['quiz.submitConfirm'] }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['results.title']),
    )
  })

  it('lets the user change a selected answer before submitting', async () => {
    const user = userEvent.setup()
    const attempt = seedAttempt(singleQuestions(1))
    renderApp([`/quiz/${attempt.id}`])

    await waitFor(() => expect(optionInputs().length).toBeGreaterThan(0))
    const inputs = optionInputs()
    await user.click(inputs[0]!.closest('label') as HTMLElement)
    expect(inputs[0]).toBeChecked()
    await user.click(inputs[1]!.closest('label') as HTMLElement)
    expect(inputs[1]).toBeChecked()
    expect(inputs[0]).not.toBeChecked()
  })

  it('shows the unanswered count in the submit confirmation', async () => {
    const user = userEvent.setup()
    const attempt = seedAttempt(singleQuestions(2))
    renderApp([`/quiz/${attempt.id}`])

    await waitFor(() => expect(optionInputs().length).toBeGreaterThan(0))
    await user.click(optionInputs()[0]!.closest('label') as HTMLElement)
    await user.click(screen.getByRole('button', { name: zh['quiz.next'] }))
    await user.click(screen.getByRole('button', { name: zh['quiz.submit'] }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('未答 1')
  })

  it('auto-submits an exam once its absolute deadline has passed', async () => {
    const attempt = seedAttempt(singleQuestions(1), 'exam')
    const exam = { ...attempt, deadlineAt: new Date(Date.now() - 1000).toISOString() }
    saveAttempt(exam)
    saveActiveAttempt(exam)

    renderApp([`/quiz/${exam.id}`])

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(zh['results.title']),
    )
  })
})
