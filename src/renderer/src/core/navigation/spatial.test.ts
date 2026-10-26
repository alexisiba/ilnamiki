import { describe, expect, it } from 'vitest'

import { findNextInDirection, groupIntoRows, isInBeam, type Rect } from './spatial'

const box = (left: number, top: number, width = 100, height = 100): Rect => ({
  left,
  top,
  right: left + width,
  bottom: top + height
})

const candidates = (rects: Record<string, Rect>): { item: string; rect: Rect }[] =>
  Object.entries(rects).map(([item, rect]) => ({ item, rect }))

describe('findNextInDirection', () => {
  const from = box(200, 200)

  it('picks the closest candidate in the direction', () => {
    const next = findNextInDirection(
      from,
      candidates({ near: box(320, 200), far: box(440, 200) }),
      'right'
    )

    expect(next).toBe('near')
  })

  it('ignores candidates behind the direction', () => {
    const next = findNextInDirection(from, candidates({ behind: box(80, 200) }), 'right')

    expect(next).toBeUndefined()
  })

  it('works in every direction', () => {
    const around = candidates({
      up: box(200, 80),
      down: box(200, 320),
      left: box(80, 200),
      right: box(320, 200)
    })

    expect(findNextInDirection(from, around, 'up')).toBe('up')
    expect(findNextInDirection(from, around, 'down')).toBe('down')
    expect(findNextInDirection(from, around, 'left')).toBe('left')
    expect(findNextInDirection(from, around, 'right')).toBe('right')
  })

  it('favors an aligned candidate over a closer misaligned one', () => {
    const next = findNextInDirection(
      from,
      candidates({ diagonal: box(310, 350), aligned: box(360, 200) }),
      'right'
    )

    expect(next).toBe('aligned')
  })

  it('breaks ties by the most centered candidate', () => {
    const next = findNextInDirection(
      box(200, 200, 300),
      candidates({ offCenter: box(200, 320), centered: box(300, 320) }),
      'down'
    )

    expect(next).toBe('centered')
  })

  it('returns undefined when there are no candidates', () => {
    expect(findNextInDirection(from, [], 'down')).toBeUndefined()
  })
})

describe('groupIntoRows', () => {
  const rowsOf = (rects: Record<string, Rect>): string[][] =>
    groupIntoRows(candidates(rects)).map((row) => row.map(({ item }) => item))

  it('puts candidates whose vertical spans overlap in one row, left to right', () => {
    expect(
      rowsOf({ save: box(400, 300), back: box(200, 320), open: box(0, 0), change: box(600, 140) })
    ).toEqual([['open'], ['change'], ['back', 'save']])
  })

  it('keeps candidates that only touch in separate rows', () => {
    expect(rowsOf({ below: box(0, 100), above: box(0, 0) })).toEqual([['above'], ['below']])
  })

  it('returns no rows without candidates', () => {
    expect(rowsOf({})).toEqual([])
  })
})

describe('isInBeam', () => {
  const from = box(200, 200)

  it('is true when the candidate overlaps across the direction', () => {
    expect(isInBeam(from, box(500, 250), 'right')).toBe(true)
    expect(isInBeam(from, box(250, 500), 'down')).toBe(true)
  })

  it('is false when the candidate is off to the side', () => {
    expect(isInBeam(from, box(500, 400), 'right')).toBe(false)
    expect(isInBeam(from, box(400, 500), 'down')).toBe(false)
  })
})
