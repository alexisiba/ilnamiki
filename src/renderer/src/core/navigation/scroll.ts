/** The closest ancestor of `element`, up to `boundary`, that scrolls horizontally. */
function findInlineScroller(element: HTMLElement, boundary: HTMLElement): HTMLElement | undefined {
  for (let node = element.parentElement; node && node !== boundary; node = node.parentElement) {
    if (node.scrollWidth > node.clientWidth) return node
  }
  return undefined
}

/**
 * Scrolls the focused `element` into view: its `group` (e.g. a shelf with its heading)
 * vertically, and the element inside the group's row, pinned to its start when `align` is
 * `start`. Chromium runs a single `scrollIntoView` at a time (a second one cancels the first),
 * so the row is scrolled with `scrollTo` instead.
 */
export function scrollFocusIntoView(
  element: HTMLElement,
  group: { element: HTMLElement; scrollAlign: 'nearest' | 'start' } | undefined,
  behavior: ScrollBehavior
): void {
  if (!group) {
    element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior })
    return
  }

  group.element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior })

  const scroller = findInlineScroller(element, group.element)
  if (!scroller) return

  const style = getComputedStyle(scroller)
  const paddingStart = parseFloat(style.scrollPaddingInlineStart) || 0
  const paddingEnd = parseFloat(style.scrollPaddingInlineEnd) || 0
  const scrollerRect = scroller.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  const start = elementRect.left - scrollerRect.left - paddingStart
  const end = elementRect.right - scrollerRect.right + paddingEnd

  let offset = 0
  if (group.scrollAlign === 'start') offset = start
  else if (start < 0) offset = start
  else if (end > 0) offset = Math.min(end, start)

  if (offset !== 0) scroller.scrollTo({ left: scroller.scrollLeft + offset, behavior })
}
