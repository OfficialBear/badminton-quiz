import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, Checkbox, OptionCard, SegmentedControl } from '@/components/ui'

describe('UI primitives', () => {
  it('Button calls onClick and blocks it when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(
      <Button onClick={onClick}>Go</Button>,
    )
    await user.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    )
    await user.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('SegmentedControl exposes radios and reports selection changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SegmentedControl
        ariaLabel="language"
        value="zh"
        onChange={onChange}
        options={[
          { value: 'zh', label: '中文' },
          { value: 'en', label: 'English' },
        ]}
      />,
    )
    expect(screen.getByRole('radio', { name: '中文' })).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('radio', { name: 'English' }))
    expect(onChange).toHaveBeenCalledWith('en')
  })

  it('Checkbox reports the new checked value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox label="Randomize" checked={false} onChange={onChange} id="cb" />)
    await user.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('OptionCard reflects the selected state', () => {
    render(
      <OptionCard title="Basic" selected onSelect={() => {}} />,
    )
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true')
  })
})
