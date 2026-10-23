import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { APP_ROUTES } from './App.routes'

function renderApp(): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(APP_ROUTES)
  render(<RouterProvider router={router} />)
  return router
}

function currentSection(): HTMLElement {
  return screen.getByRole('link', { current: 'page' })
}

describe('App', () => {
  it('starts on the home section', () => {
    renderApp()

    expect(currentSection()).toHaveTextContent('Home')
  })

  it('opens a section when its tab is clicked', async () => {
    renderApp()

    await userEvent.setup().click(screen.getByRole('link', { name: 'Library' }))

    expect(currentSection()).toHaveTextContent('Library')
    expect(screen.getByRole('heading', { level: 1, name: 'Library' })).toBeInTheDocument()
  })

  it('moves to the next section on nextSection', async () => {
    renderApp()

    await userEvent.setup().keyboard('e')

    expect(currentSection()).toHaveTextContent('Library')
  })

  it('wraps to the last section on prevSection from the first one', async () => {
    renderApp()

    await userEvent.setup().keyboard('q')

    expect(currentSection()).toHaveTextContent('Settings')
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument()
  })

  it('wraps to the first section on nextSection from the last one', async () => {
    renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Settings' }))
    await user.keyboard('e')

    expect(currentSection()).toHaveTextContent('Home')
  })

  it('switches sections with the on-screen shoulder hints', async () => {
    renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'RB' }))
    expect(currentSection()).toHaveTextContent('Library')

    await user.click(screen.getByRole('button', { name: 'LB' }))
    expect(currentSection()).toHaveTextContent('Home')
  })

  it('does not stack history when switching sections', async () => {
    const router = renderApp()
    const user = userEvent.setup()

    await user.click(screen.getByRole('link', { name: 'Library' }))
    await user.keyboard('e')
    await router.navigate(-1)

    expect(currentSection()).toHaveTextContent('Settings')
  })
})
