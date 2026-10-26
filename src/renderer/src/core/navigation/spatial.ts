import type { Direction } from '@renderer/core/input'

/** The part of a `DOMRect` spatial navigation needs. */
export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

export interface SpatialCandidate<T> {
  item: T
  rect: Rect
}

/** How much a misalignment on the cross axis costs compared to distance along the direction. */
const CROSS_AXIS_WEIGHT = 2

const isHorizontal = (direction: Direction): boolean =>
  direction === 'left' || direction === 'right'

const centerX = (rect: Rect): number => (rect.left + rect.right) / 2
const centerY = (rect: Rect): number => (rect.top + rect.bottom) / 2

/** Whether `to` lies past `from` in `direction`, comparing their centers. */
function isInDirection(from: Rect, to: Rect, direction: Direction): boolean {
  switch (direction) {
    case 'right':
      return centerX(to) > centerX(from)
    case 'left':
      return centerX(to) < centerX(from)
    case 'down':
      return centerY(to) > centerY(from)
    case 'up':
      return centerY(to) < centerY(from)
  }
}

/** Empty space between `from` and `to` along `direction` (0 when they touch or overlap). */
function gapAlong(from: Rect, to: Rect, direction: Direction): number {
  switch (direction) {
    case 'right':
      return Math.max(0, to.left - from.right)
    case 'left':
      return Math.max(0, from.left - to.right)
    case 'down':
      return Math.max(0, to.top - from.bottom)
    case 'up':
      return Math.max(0, from.top - to.bottom)
  }
}

/** Empty space between `from` and `to` across `direction` (0 when they overlap). */
function gapAcross(from: Rect, to: Rect, direction: Direction): number {
  return isHorizontal(direction)
    ? Math.max(0, to.top - from.bottom, from.top - to.bottom)
    : Math.max(0, to.left - from.right, from.left - to.right)
}

/** Whether `to` overlaps `from` across `direction`, i.e. is straight ahead of it. */
export function isInBeam(from: Rect, to: Rect, direction: Direction): boolean {
  return isHorizontal(direction)
    ? to.top < from.bottom && from.top < to.bottom
    : to.left < from.right && from.left < to.right
}

/**
 * The candidates in rows, top to bottom, each row left to right: candidates whose vertical
 * spans overlap a row's share it (e.g. a path's Change path button and nothing else, or Back
 * and Save side by side).
 */
export function groupIntoRows<T>(candidates: SpatialCandidate<T>[]): SpatialCandidate<T>[][] {
  const byTop = [...candidates].sort((a, b) => a.rect.top - b.rect.top)
  const rows: { bottom: number; members: SpatialCandidate<T>[] }[] = []

  for (const candidate of byTop) {
    const row = rows.at(-1)
    if (row && candidate.rect.top < row.bottom) {
      row.members.push(candidate)
      row.bottom = Math.max(row.bottom, candidate.rect.bottom)
    } else {
      rows.push({ bottom: candidate.rect.bottom, members: [candidate] })
    }
  }

  return rows.map(({ members }) => members.sort((a, b) => a.rect.left - b.rect.left))
}

/**
 * The candidate that is visually next to `from` in `direction`: the closest one past it,
 * favoring candidates aligned with it. `undefined` when nothing lies in that direction.
 */
export function findNextInDirection<T>(
  from: Rect,
  candidates: SpatialCandidate<T>[],
  direction: Direction
): T | undefined {
  let best: { item: T; score: number; offset: number } | undefined

  for (const { item, rect } of candidates) {
    if (!isInDirection(from, rect, direction)) continue

    const score =
      gapAlong(from, rect, direction) + CROSS_AXIS_WEIGHT * gapAcross(from, rect, direction)
    // Breaks ties between equally close candidates by how centered they are.
    const offset = isHorizontal(direction)
      ? Math.abs(centerY(rect) - centerY(from))
      : Math.abs(centerX(rect) - centerX(from))

    if (!best || score < best.score || (score === best.score && offset < best.offset)) {
      best = { item, score, offset }
    }
  }

  return best?.item
}
