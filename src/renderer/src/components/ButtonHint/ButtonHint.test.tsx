import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useActiveInputDevice } from '@renderer/core/input'

import { ButtonHint } from './ButtonHint'

vi.mock('@renderer/core/input', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@renderer/core/input')>()),
  useActiveInputDevice: vi.fn()
}))

describe('ButtonHint', () => {
  beforeEach(() => {
    vi.mocked(useActiveInputDevice).mockReturnValue('xbox')
  })

  it('shows the button for the action on the active device', () => {
    render(<ButtonHint action="confirm" />)

    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows the contextual label next to the button', () => {
    render(<ButtonHint action="tertiary" label="Search" />)

    expect(screen.getByText('Y')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('names d-pad directions', () => {
    render(<ButtonHint action="up" />)

    expect(screen.getByRole('img', { name: 'D-pad up' })).toBeInTheDocument()
  })

  it('names PlayStation symbols', () => {
    vi.mocked(useActiveInputDevice).mockReturnValue('playstation')
    render(<ButtonHint action="confirm" />)

    expect(screen.getByRole('img', { name: 'Cross' })).toHaveTextContent('✕')
  })

  it('shows translated key names on keyboard', () => {
    vi.mocked(useActiveInputDevice).mockReturnValue('keyboard')
    render(<ButtonHint action="nextGroup" />)

    expect(screen.getByText('PgDn')).toBeInTheDocument()
  })

  it('follows the active device', () => {
    const { rerender } = render(<ButtonHint action="prevSection" />)
    expect(screen.getByText('LB')).toBeInTheDocument()

    vi.mocked(useActiveInputDevice).mockReturnValue('keyboard')
    rerender(<ButtonHint action="prevSection" />)

    expect(screen.getByText('Q')).toBeInTheDocument()
  })
})
