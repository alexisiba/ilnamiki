import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { ButtonGuide } from './ButtonGuide'

function renderGuideAt(path: string): HTMLElement {
  const router = createMemoryRouter([{ path: '*', element: <ButtonGuide /> }], {
    initialEntries: [path]
  })
  render(<RouterProvider router={router} />)
  return screen.getByRole('contentinfo', { name: 'Controls' })
}

describe('ButtonGuide', () => {
  it('explains select, search and switching tabs', () => {
    const guide = renderGuideAt('/')

    const hints = within(guide).getAllByRole('listitem')
    expect(hints).toHaveLength(3)
    expect(hints[0]).toHaveTextContent('ASelect')
    expect(hints[1]).toHaveTextContent('YSearch')
    expect(hints[2]).toHaveTextContent('LBRBSwitch tab')
  })

  it('hides back at the root of a section', () => {
    const guide = renderGuideAt('/library')

    expect(within(guide).queryByText('Back')).not.toBeInTheDocument()
  })

  it('shows back on a screen inside a section', () => {
    const guide = renderGuideAt('/games/mgs-ps1')

    const hints = within(guide).getAllByRole('listitem')
    expect(hints[1]).toHaveTextContent('BBack')
  })

  it('is informative only, with nothing to focus or click', () => {
    const guide = renderGuideAt('/games/mgs-ps1')

    expect(within(guide).queryAllByRole('button')).toHaveLength(0)
    expect(within(guide).queryAllByRole('link')).toHaveLength(0)
    expect(guide).not.toHaveAttribute('tabindex')
  })
})
