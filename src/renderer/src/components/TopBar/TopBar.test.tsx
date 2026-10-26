import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { useScreenActions, type ScreenActions } from '@renderer/core/input'
import { getPlayedSounds } from '@renderer/test/audio'

import { TopBar } from './TopBar'

function TopBarOnScreen({ actions }: { actions: ScreenActions }): React.JSX.Element {
  useScreenActions(actions)
  return <TopBar />
}

function renderTopBar(actions: ScreenActions = {}): void {
  const router = createMemoryRouter([{ path: '*', element: <TopBarOnScreen actions={actions} /> }])
  render(<RouterProvider router={router} />)
}

describe('TopBar', () => {
  it('shows a button for each shoulder action', () => {
    renderTopBar()

    expect(screen.getByRole('button', { name: 'Q' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'E' })).toBeInTheDocument()
  })

  it('sounds a tab switch when the section changes, not when clicking the current one', async () => {
    renderTopBar()
    const user = userEvent.setup()

    await user.keyboard('e')
    await user.click(screen.getByRole('button', { name: 'Q' }))
    await user.click(screen.getByRole('link', { current: 'page' }))
    await user.click(screen.getByRole('link', { name: 'Settings' }))

    expect(getPlayedSounds()).toEqual(['switch-tab', 'switch-tab', 'switch-tab'])
  })

  it('leaves out the button of a shoulder action the screen turns off', () => {
    renderTopBar({ prevSection: false })

    expect(screen.queryByRole('button', { name: 'Q' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'E' })).toBeInTheDocument()
  })
})
