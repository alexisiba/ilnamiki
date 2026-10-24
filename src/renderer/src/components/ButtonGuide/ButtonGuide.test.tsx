import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { useDefaultActions, useScreenActions, type ScreenActions } from '@renderer/core/input'
import { connectGamepad, PLAYSTATION_GAMEPAD_ID } from '@renderer/test/gamepad'

import { ButtonGuide } from './ButtonGuide'

/** The guide with search as the tertiary action's default, as in the app. */
function GuideWithDefaults({
  screenActions = {}
}: {
  screenActions?: ScreenActions
}): React.JSX.Element {
  useDefaultActions({ tertiary: { label: 'Search', onPress: () => {} } })
  useScreenActions(screenActions)
  return <ButtonGuide />
}

function renderGuideAt(path: string, screenActions?: ScreenActions): HTMLElement {
  const router = createMemoryRouter(
    [{ path: '*', element: <GuideWithDefaults screenActions={screenActions} /> }],
    { initialEntries: [path] }
  )
  render(<RouterProvider router={router} />)
  return screen.getByRole('contentinfo', { name: 'Controls' })
}

const hintTexts = (guide: HTMLElement): (string | null)[] =>
  within(guide)
    .getAllByRole('listitem')
    .map((hint) => hint.textContent)

describe('ButtonGuide', () => {
  it('explains navigating, select, search and switching tabs with keyboard keys at first', () => {
    const guide = renderGuideAt('/')

    const hints = within(guide).getAllByRole('listitem')
    expect(hints).toHaveLength(4)
    expect(hints[0]).toHaveTextContent('↑↓←→Navigate')
    expect(hints[1]).toHaveTextContent('EnterSelect')
    expect(hints[2]).toHaveTextContent('YSearch')
    expect(hints[3]).toHaveTextContent('QESwitch tab')
  })

  it('hides back at the root of a section', () => {
    const guide = renderGuideAt('/library')

    expect(within(guide).queryByText('Back')).not.toBeInTheDocument()
  })

  it('shows back on a screen inside a section', () => {
    const guide = renderGuideAt('/games/mgs-ps1')

    const hints = within(guide).getAllByRole('listitem')
    expect(hints[2]).toHaveTextContent('EscBack')
  })

  it('hides the hints of the actions the screen turns off', () => {
    const guide = renderGuideAt('/games/mgs-ps1', {
      back: false,
      tertiary: false,
      prevSection: false
    })

    expect(hintTexts(guide)).toEqual(['↑↓←→Navigate', 'EnterSelect', 'ESwitch tab'])
  })

  it('keeps navigating while some direction is on', () => {
    const guide = renderGuideAt('/', { up: false, down: false })

    expect(hintTexts(guide)[0]).toBe('↑↓←→Navigate')
  })

  it('hides navigating when every direction is off', () => {
    const guide = renderGuideAt('/', { up: false, down: false, left: false, right: false })

    expect(within(guide).queryByText('Navigate')).not.toBeInTheDocument()
  })

  it('shows the screen’s own contextual actions with their labels, in their order', () => {
    const guide = renderGuideAt('/', {
      secondary: { label: 'Favorite', onPress: () => {} },
      tertiary: { label: 'Sort', onPress: () => {} }
    })

    expect(hintTexts(guide)).toEqual([
      '↑↓←→Navigate',
      'EnterSelect',
      'XFavorite',
      'YSort',
      'QESwitch tab'
    ])
  })

  it('switches to Xbox buttons once an Xbox controller is used, and back with the keyboard', async () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
    vi.spyOn(document, 'hasFocus').mockReturnValue(true)
    const gamepad = connectGamepad()
    const guide = renderGuideAt('/')

    gamepad.press(0)
    act(() => vi.advanceTimersToNextFrame())
    vi.useRealTimers()

    const hints = within(guide).getAllByRole('listitem')
    expect(within(hints[0]).getByRole('img', { name: 'D-pad' })).toBeInTheDocument()
    expect(hints[1]).toHaveTextContent('ASelect')
    expect(hints[3]).toHaveTextContent('LBRBSwitch tab')

    await userEvent.setup().keyboard('{ArrowDown}')

    expect(hints[1]).toHaveTextContent('EnterSelect')
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

  it('shows the given hints instead of the current screen’s', () => {
    render(
      <ButtonGuide
        hints={[
          { action: 'confirm', label: 'Select' },
          { action: 'back', label: 'Close' }
        ]}
      />
    )

    const hints = within(screen.getByRole('contentinfo', { name: 'Controls' })).getAllByRole(
      'listitem'
    )
    expect(hints.map((hint) => hint.textContent)).toEqual(['EnterSelect', 'EscClose'])
  })

  it('is informative only, with nothing to focus or click', () => {
    const guide = renderGuideAt('/games/mgs-ps1')

    expect(within(guide).queryAllByRole('button')).toHaveLength(0)
    expect(within(guide).queryAllByRole('link')).toHaveLength(0)
    expect(guide).not.toHaveAttribute('tabindex')
  })
})
