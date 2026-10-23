import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('is named by its label', () => {
    render(<Button>Download</Button>)

    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument()
  })

  it('moves DOM focus to itself when focused', () => {
    render(
      <>
        <Button>First</Button>
        <Button focused>Second</Button>
      </>
    )

    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus()
  })

  it('calls onPress when clicked', async () => {
    const onPress = vi.fn()
    render(<Button onPress={onPress}>Download</Button>)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Download' }))

    expect(onPress).toHaveBeenCalledOnce()
  })
})
