import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithNavigation } from '@renderer/test/renderWithNavigation'

import { Button } from './Button'

describe('Button', () => {
  it('is named by its label', () => {
    render(<Button focusId="download">Download</Button>)

    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument()
  })

  it('takes focus when auto-focused', () => {
    renderWithNavigation(
      <>
        <Button focusId="first">First</Button>
        <Button focusId="second" autoFocus>
          Second
        </Button>
      </>
    )

    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus()
  })

  it('calls onPress on confirm while focused', async () => {
    const onPress = vi.fn()
    renderWithNavigation(
      <Button focusId="download" onPress={onPress}>
        Download
      </Button>
    )

    await userEvent.setup().keyboard('{Enter}')

    expect(onPress).toHaveBeenCalledOnce()
  })

  it('does nothing when unavailable, but can still be focused', async () => {
    const onPress = vi.fn()
    renderWithNavigation(
      <Button focusId="add" aria-disabled onPress={onPress}>
        Add
      </Button>
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.keyboard('{Enter}')

    expect(onPress).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Add' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('calls onPress when clicked', async () => {
    const onPress = vi.fn()
    render(
      <Button focusId="download" onPress={onPress}>
        Download
      </Button>
    )

    await userEvent.setup().click(screen.getByRole('button', { name: 'Download' }))

    expect(onPress).toHaveBeenCalledOnce()
  })
})
