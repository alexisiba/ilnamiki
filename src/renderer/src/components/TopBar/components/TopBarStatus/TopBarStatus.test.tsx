import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { connectGamepad, type FakeGamepad } from '@renderer/test/gamepad'

import { TopBarStatus } from './TopBarStatus'

const gamepadIcon = (): HTMLElement | null =>
  screen.queryByRole('img', { name: 'Controller connected' })

describe('TopBarStatus', () => {
  it('shows no controller icon while no gamepad is connected', () => {
    render(<TopBarStatus />)

    expect(gamepadIcon()).not.toBeInTheDocument()
  })

  it('shows the controller icon when a gamepad is already connected', () => {
    connectGamepad()
    render(<TopBarStatus />)

    expect(gamepadIcon()).toBeInTheDocument()
  })

  it('shows and hides the controller icon as a gamepad connects and disconnects', () => {
    render(<TopBarStatus />)

    let gamepad: FakeGamepad | undefined
    act(() => {
      gamepad = connectGamepad()
    })
    expect(gamepadIcon()).toBeInTheDocument()

    act(() => gamepad?.disconnect())
    expect(gamepadIcon()).not.toBeInTheDocument()
  })

  it('keeps the icon while another gamepad stays connected', () => {
    const first = connectGamepad()
    connectGamepad()
    render(<TopBarStatus />)

    act(() => first.disconnect())

    expect(gamepadIcon()).toBeInTheDocument()
  })
})
