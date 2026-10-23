import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { setRect } from '@renderer/test/layout'

import { FocusGroup } from '../FocusGroup'
import { useFocusable } from '../useFocusable'
import { NavigationProvider } from './NavigationProvider'

interface ItemProps {
  id: string
  autoFocus?: boolean
  focusOnHover?: boolean
  onClick?: () => void
}

function Item({ id, autoFocus, focusOnHover, onClick }: ItemProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLButtonElement>({ id, autoFocus, focusOnHover })
  return (
    <button ref={ref} type="button" onClick={onClick}>
      {id}
    </button>
  )
}

/** Two rows of three items, like two shelves; `top` sits above `bottom`. */
function Rows({
  autoFocus,
  onClick
}: {
  autoFocus?: string
  onClick?: () => void
}): React.JSX.Element {
  return (
    <>
      {(['top', 'bottom'] as const).map((row) => (
        <FocusGroup key={row} id={row}>
          {[1, 2, 3].map((column) => (
            <Item
              key={column}
              id={`${row}${column}`}
              autoFocus={`${row}${column}` === autoFocus}
              onClick={onClick}
            />
          ))}
        </FocusGroup>
      ))}
    </>
  )
}

const item = (name: string): HTMLElement => screen.getByRole('button', { name })

function layOutRows(): void {
  ;(['top', 'bottom'] as const).forEach((row, rowIndex) => {
    ;[1, 2, 3].forEach((column, columnIndex) => {
      setRect(item(`${row}${column}`), {
        left: columnIndex * 120,
        top: rowIndex * 120,
        width: 100,
        height: 100
      })
    })
  })
}

function renderRows(options: { autoFocus?: string; onClick?: () => void } = {}): void {
  render(
    <NavigationProvider>
      <Rows {...options} />
    </NavigationProvider>
  )
  layOutRows()
}

describe('NavigationProvider', () => {
  it('focuses the auto-focused item when it opens', () => {
    renderRows({ autoFocus: 'top2' })

    expect(item('top2')).toHaveFocus()
  })

  it('focuses the first item when none is auto-focused', () => {
    renderRows()

    expect(item('top1')).toHaveFocus()
  })

  it('moves focus to the item in the pressed direction', async () => {
    renderRows()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}')
    expect(item('top2')).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(item('bottom2')).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(item('bottom3')).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(item('bottom2')).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(item('top2')).toHaveFocus()
  })

  it('stays on the last item of a row instead of wrapping or jumping rows', async () => {
    renderRows({ autoFocus: 'top3' })
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}')
    expect(item('top3')).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(item('top3')).toHaveFocus()
  })

  it('returns to the last focused item of a group when entering it again', async () => {
    renderRows()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}{ArrowLeft}{ArrowLeft}{ArrowUp}')

    expect(item('top3')).toHaveFocus()
  })

  it('clicks the focused item on confirm', async () => {
    const onClick = vi.fn()
    renderRows({ onClick })

    await userEvent.setup().keyboard('{Enter}')

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('focuses the item the pointer moves over', async () => {
    renderRows()

    await userEvent.setup().pointer({ target: item('bottom3'), coords: { x: 300, y: 150 } })

    expect(item('bottom3')).toHaveFocus()
  })

  it('ignores pointer events that report no movement', async () => {
    renderRows()
    const user = userEvent.setup()

    await user.pointer({ target: item('bottom3'), coords: { x: 300, y: 150 } })
    await user.keyboard('{ArrowLeft}')
    // Content scrolled under a still pointer: same position, reported on another element.
    await user.pointer({ target: item('bottom3'), coords: { x: 300, y: 150 } })

    expect(item('bottom2')).toHaveFocus()
  })

  it('does not focus items without hover focus when the pointer moves over them', async () => {
    render(
      <NavigationProvider>
        <Item id="first" />
        <Item id="second" focusOnHover={false} />
      </NavigationProvider>
    )

    await userEvent.setup().pointer({ target: item('second'), coords: { x: 300, y: 150 } })

    expect(item('first')).toHaveFocus()
  })

  it('remembers an item without hover focus when it is pressed', async () => {
    const user = userEvent.setup()
    const items = (
      <>
        <Item id="first" focusOnHover={false} />
        <Item id="second" focusOnHover={false} />
      </>
    )
    const { rerender } = render(<NavigationProvider scope="home">{items}</NavigationProvider>)

    await user.click(item('second'))
    rerender(
      <NavigationProvider scope="library">
        <Item id="library" />
      </NavigationProvider>
    )
    rerender(<NavigationProvider scope="home">{items}</NavigationProvider>)

    expect(item('second')).toHaveFocus()
  })

  it('focuses an item again on a direction when focus was lost', async () => {
    renderRows({ autoFocus: 'top2' })
    const user = userEvent.setup()

    act(() => item('top2').blur())
    await user.keyboard('{ArrowDown}')

    expect(item('top2')).toHaveFocus()
  })

  it('restores the last focused item when its scope comes back', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <NavigationProvider scope="home">
        <Rows />
      </NavigationProvider>
    )
    layOutRows()
    await user.keyboard('{ArrowDown}{ArrowRight}')

    rerender(
      <NavigationProvider scope="library">
        <Item id="library" />
      </NavigationProvider>
    )
    expect(item('library')).toHaveFocus()

    rerender(
      <NavigationProvider scope="home">
        <Rows autoFocus="top1" />
      </NavigationProvider>
    )
    expect(item('bottom2')).toHaveFocus()
  })

  it('scrolls the initial item through its group from the first render', () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    render(
      <NavigationProvider>
        <FocusGroup id="shelf" as="section">
          <Item id="card" autoFocus />
        </FocusGroup>
      </NavigationProvider>
    )

    expect(scrollIntoView.mock.contexts).toEqual([item('card').closest('section')])
  })
})
