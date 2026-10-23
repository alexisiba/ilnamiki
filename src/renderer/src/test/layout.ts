/**
 * jsdom does not lay out elements, so every rect is empty. Tests that depend on where
 * elements are (spatial navigation) place them with `setRect`.
 */
const rects = new WeakMap<Element, DOMRect>()

const EMPTY_RECT = { left: 0, top: 0, width: 0, height: 0 }

function toDOMRect({ left, top, width, height }: typeof EMPTY_RECT): DOMRect {
  const rect = {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height
  }
  return { ...rect, toJSON: () => rect }
}

export function setRect(element: Element, rect: typeof EMPTY_RECT): void {
  rects.set(element, toDOMRect(rect))
}

export function getMockedRect(element: Element): DOMRect {
  return rects.get(element) ?? toDOMRect(EMPTY_RECT)
}
