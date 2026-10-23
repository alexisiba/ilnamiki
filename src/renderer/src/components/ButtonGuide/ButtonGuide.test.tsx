import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { connectGamepad, PLAYSTATION_GAMEPAD_ID } from '@renderer/test/gamepad'

import { ButtonGuide } from './ButtonGuide'

function renderGuideAt(path: string): HTMLElement {
  const router = createMemoryRouter([{ path: '*', element: <ButtonGuide /> }], {
    initialEntries: [path]
  })
  render(<RouterProvider router={router} />)
  return screen.getByRole('contentinfo', { name: 'Controls' })
}

describe('ButtonGuide', () => {
  it('explains navigating, select, search and switching tabs', () => {
    const guide = renderGuideAt('/')

    const hints = within(guide).getAllByRole('listitem')
    expect(hints).toHaveLength(4)
    expect(within(hints[0]).getByRole('img', { name: 'D-pad' })).toBeInTheDocument()
    expect(hints[0]).toHaveTextContent('Navigate')
    expect(hints[1]).toHaveTextContent('ASelect')
    expect(hints[2]).toHaveTextContent('YSearch')
    expect(hints[3]).toHaveTextContent('LBRBSwitch tab')
  })

  it('hides back at the root of a section', () => {
    const guide = renderGuideAt('/library')

    expect(within(guide).queryByText('Back')).not.toBeInTheDocument()
  })

  it('shows back on a screen inside a section', () => {
    const guide = renderGuideAt('/games/mgs-ps1')

    const hints = within(guide).getAllByRole('listitem')
    expect(hints[2]).toHaveTextContent('BBack')
  })

  it('switches to keyboard keys once the keyboard is used', async () => {
    const guide = renderGuideAt('/')

    await userEvent.setup().keyboard('{ArrowDown}')

    const hints = within(guide).getAllByRole('listitem')
    expect(hints[0]).toHaveTextContent('↑↓←→Navigate')
    expect(hints[1]).toHaveTextContent('EnterSelect')
    expect(hints[3]).toHaveTextContent('QESwitch tab')
  })

  it('switches to PlayStation buttons once a PlayStation controller is used', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
    vi.spyOn(document, 'hasFocus').mockReturnValue(true)
    const gamepad = connectGamepad(PLAYSTATION_GAMEPAD_ID)
    const guide = renderGuideAt('/')

    gamepad.press(0)
    act(() => vi.advanceTimersToNextFrame())
    vi.useRealTimers()

    const hints = within(guide).getAllByRole('listitem')
    expect(within(hints[1]).getByRole('img', { name: 'Cross' })).toBeInTheDocument()
    expect(hints[3]).toHaveTextContent('L1R1Switch tab')
  })

  it('is informative only, with nothing to focus or click', () => {
    const guide = renderGuideAt('/games/mgs-ps1')

    expect(within(guide).queryAllByRole('button')).toHaveLength(0)
    expect(within(guide).queryAllByRole('link')).toHaveLength(0)
    expect(guide).not.toHaveAttribute('tabindex')
  })
})
