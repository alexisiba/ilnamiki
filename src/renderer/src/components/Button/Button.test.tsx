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
