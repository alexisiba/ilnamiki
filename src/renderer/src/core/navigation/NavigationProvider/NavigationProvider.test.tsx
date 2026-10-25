import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { setRect } from '@renderer/test/layout'

import { FocusGroup } from '../FocusGroup'
import { useFocusable } from '../useFocusable'
import { useGroupFocus } from '../useGroupFocus'
import { useLastFocusedId } from '../useLastFocusedId'
import { useRememberedState } from '../useRememberedState'
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

  describe('in a group that moves by rows', () => {
    /** A details screen: open; a path with change on its right; remove; back and save. */
    function renderDetailsScreen(): void {
      render(
        <NavigationProvider>
          <FocusGroup id="details" movement="rows">
            {['open', 'change', 'remove', 'back', 'save'].map((id) => (
              <Item key={id} id={id} />
            ))}
          </FocusGroup>
        </NavigationProvider>
      )
      setRect(item('open'), { left: 0, top: 0, width: 260, height: 60 })
      setRect(item('change'), { left: 1200, top: 120, width: 240, height: 60 })
      setRect(item('remove'), { left: 0, top: 240, width: 300, height: 60 })
      setRect(item('back'), { left: 1000, top: 400, width: 160, height: 60 })
      setRect(item('save'), { left: 1200, top: 400, width: 240, height: 60 })
    }

    it('goes up and down row by row, to each row’s first item', async () => {
      renderDetailsScreen()
      const user = userEvent.setup()

      for (const name of ['change', 'remove', 'back']) {
        await user.keyboard('{ArrowDown}')
        expect(item(name)).toHaveFocus()
      }
      for (const name of ['remove', 'change', 'open']) {
        await user.keyboard('{ArrowUp}')
        expect(item(name)).toHaveFocus()
      }
    })

    it('moves left and right only within the row', async () => {
      renderDetailsScreen()
      const user = userEvent.setup()

      await user.keyboard('{ArrowRight}')
      expect(item('open')).toHaveFocus()

      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowRight}')
      expect(item('save')).toHaveFocus()
      await user.keyboard('{ArrowRight}{ArrowDown}')
      expect(item('save')).toHaveFocus()
      await user.keyboard('{ArrowLeft}')
      expect(item('back')).toHaveFocus()
    })

    it('returns to the item last focused in a row when coming back to it', async () => {
      renderDetailsScreen()
      const user = userEvent.setup()

      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowRight}{ArrowUp}')
      expect(item('remove')).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(item('save')).toHaveFocus()
    })
  })

  it('moves sideways into a column whose items are not level with the focused one', async () => {
    // A column with one item at the top, beside a list of two rows.
    render(
      <NavigationProvider>
        <FocusGroup id="column">
          <Item id="category" />
        </FocusGroup>
        <FocusGroup id="list">
          <Item id="row1" />
          <Item id="row2" />
        </FocusGroup>
      </NavigationProvider>
    )
    setRect(item('category').parentElement!, { left: 0, top: 0, width: 200, height: 400 })
    setRect(item('category'), { left: 0, top: 0, width: 200, height: 100 })
    setRect(item('row1'), { left: 240, top: 0, width: 400, height: 100 })
    setRect(item('row2'), { left: 240, top: 300, width: 400, height: 100 })

    await userEvent.setup().keyboard('{ArrowRight}{ArrowDown}{ArrowLeft}')

    expect(item('category')).toHaveFocus()
  })

  it('moves focus into a group on request, to the item asked for', async () => {
    function FocusTopThird(): React.JSX.Element {
      const focusTop = useGroupFocus('top')
      return <Item id="focus top3" onClick={() => focusTop('top3')} />
    }
    render(
      <NavigationProvider>
        <Rows />
        <FocusTopThird />
      </NavigationProvider>
    )
    layOutRows()

    await userEvent.setup().click(item('focus top3'))

    expect(item('top3')).toHaveFocus()
  })

  it('moves focus into a group on request, to its last focused item', async () => {
    function FocusTop(): React.JSX.Element {
      const focusTop = useGroupFocus('top')
      return <Item id="focus top" onClick={() => focusTop()} />
    }
    render(
      <NavigationProvider>
        <Rows />
        <FocusTop />
      </NavigationProvider>
    )
    layOutRows()
    const user = userEvent.setup()

    await user.keyboard('{ArrowRight}')
    await user.click(item('focus top'))

    expect(item('top2')).toHaveFocus()
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

  it('tells which item of a group was focused last, from the first render', async () => {
    function LastFocused(): React.JSX.Element {
      return <p>{useLastFocusedId('bottom') ?? 'none'}</p>
    }
    const user = userEvent.setup()
    const { rerender } = render(
      <NavigationProvider>
        <Rows />
      </NavigationProvider>
    )
    layOutRows()

    await user.keyboard('{ArrowDown}{ArrowRight}')
    rerender(
      <NavigationProvider>
        <LastFocused />
      </NavigationProvider>
    )

    expect(screen.getByText('bottom2')).toBeInTheDocument()
  })

  describe('useRememberedState', () => {
    function Counter(): React.JSX.Element {
      const [count, setCount] = useRememberedState('count', 0)
      return (
        <button type="button" onClick={() => setCount(count + 1)}>
          {`Count ${count}`}
        </button>
      )
    }

    /** The counter screens (`library`, `settings`) or a screen without it (`other`). */
    const screenOf = (scope: string): React.JSX.Element => (
      <NavigationProvider scope={scope}>
        {scope === 'other' ? <p>Other screen</p> : <Counter />}
      </NavigationProvider>
    )

    it('keeps a screen’s state when the screen comes back', async () => {
      const { rerender } = render(screenOf('library'))

      await userEvent.setup().click(screen.getByRole('button', { name: 'Count 0' }))
      rerender(screenOf('other'))
      rerender(screenOf('library'))

      expect(screen.getByRole('button', { name: 'Count 1' })).toBeInTheDocument()
    })

    it('keeps the state of each screen apart', async () => {
      const { rerender } = render(screenOf('library'))

      await userEvent.setup().click(screen.getByRole('button', { name: 'Count 0' }))
      rerender(screenOf('other'))
      rerender(screenOf('settings'))

      expect(screen.getByRole('button', { name: 'Count 0' })).toBeInTheDocument()
    })
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

  it('keeps moving through items that re-register as they take focus, after a restore', async () => {
    // Like Settings' categories: focusing a tab selects it, and only the selected one is
    // auto-focused, so the tabs register again whenever focus moves between them.
    function Tab({
      id,
      selected,
      onFocus
    }: {
      id: string
      selected: boolean
      onFocus: () => void
    }): React.JSX.Element {
      const { ref } = useFocusable<HTMLButtonElement>({ id, autoFocus: selected })
      return (
        <button ref={ref} type="button" onFocus={onFocus}>
          {id}
        </button>
      )
    }
    function Tabs(): React.JSX.Element {
      const [selected, setSelected] = useState('tab1')
      return (
        <FocusGroup id="tabs">
          {['tab1', 'tab2', 'tab3'].map((id) => (
            <Tab key={id} id={id} selected={id === selected} onFocus={() => setSelected(id)} />
          ))}
        </FocusGroup>
      )
    }
    const layOutTabs = (): void => {
      ;['tab1', 'tab2', 'tab3'].forEach((id, index) => {
        setRect(item(id), { left: 0, top: index * 80, width: 300, height: 70 })
      })
    }
    const user = userEvent.setup()
    const { rerender } = render(
      <NavigationProvider scope="settings">
        <Tabs />
      </NavigationProvider>
    )
    // Leaving the screen with a tab focused, and coming back, restores that tab.
    rerender(
      <NavigationProvider scope="home">
        <Item id="home" />
      </NavigationProvider>
    )
    rerender(
      <NavigationProvider scope="settings">
        <Tabs />
      </NavigationProvider>
    )
    layOutTabs()
    expect(item('tab1')).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(item('tab2')).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(item('tab3')).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(item('tab2')).toHaveFocus()
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
