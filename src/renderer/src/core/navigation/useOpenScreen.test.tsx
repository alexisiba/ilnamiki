import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { useGoBack } from './useGoBack'
import { useOpenScreen } from './useOpenScreen'

function Opener({ to }: { to: string }): React.JSX.Element {
  const openScreen = useOpenScreen()
  return (
    <button type="button" onClick={() => openScreen(to)}>
      Open
    </button>
  )
}

function Leaver(): React.JSX.Element {
  const goBack = useGoBack()
  return (
    <button type="button" onClick={goBack}>
      Leave
    </button>
  )
}

function renderScreens(): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      { path: '/library', element: <Opener to="/library/nes" /> },
      {
        path: '/library/nes',
        element: (
          <>
            <Opener to="/games/dk-64" />
            <Leaver />
          </>
        )
      },
      { path: '/games/dk-64', element: <Leaver /> }
    ],
    { initialEntries: ['/library'] }
  )
  render(<RouterProvider router={router} />)
  return router
}

describe('useOpenScreen and useGoBack', () => {
  it('go back to the screen that opened each one, level by level', async () => {
    const router = renderScreens()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(router.state.location.pathname).toBe('/games/dk-64')

    await user.click(screen.getByRole('button', { name: 'Leave' }))
    expect(router.state.location.pathname).toBe('/library/nes')

    await user.click(screen.getByRole('button', { name: 'Leave' }))
    expect(router.state.location.pathname).toBe('/library')
  })

  it('go back without stacking history', async () => {
    const router = renderScreens()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Open' }))

    await user.click(screen.getByRole('button', { name: 'Leave' }))
    await router.navigate(-1)

    expect(router.state.location.pathname).toBe('/library')
  })
})
