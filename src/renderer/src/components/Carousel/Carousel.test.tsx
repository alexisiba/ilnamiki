import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Carousel } from './Carousel'

/** A carousel of `count` items named "Item 1", "Item 2"…, with `selectedIndex` in front. */
function renderItems(count: number, selectedIndex = 0): void {
  render(
    <Carousel selectedIndex={selectedIndex} spacing="100px" details={<p>Details</p>}>
      {Array.from({ length: count }, (_, index) => (
        <span key={index}>{`Item ${index + 1}`}</span>
      ))}
    </Carousel>
  )
}

describe('Carousel', () => {
  it('shows each item as a list item, in order', () => {
    renderItems(3)

    const items = screen.getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(['Item 1', 'Item 2', 'Item 3'])
  })

  it('shows the details of the selected item outside the list', () => {
    renderItems(3)

    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(within(screen.getByRole('list')).queryByText('Details')).not.toBeInTheDocument()
  })

  it('shows dots instead of the position as text for fewer than 15 items', () => {
    renderItems(14, 2)

    expect(screen.queryByText('3 / 14')).not.toBeInTheDocument()
  })

  it('shows the position as text from 15 items', () => {
    renderItems(15, 2)

    expect(screen.getByText('3 / 15')).toBeInTheDocument()
  })
})
