import type { Direction } from './input'

/** How long a held direction waits before it starts repeating. */
export const REPEAT_DELAY_MS = 400
/** Time between repeats once a held direction is repeating. */
export const REPEAT_INTERVAL_MS = 120

export interface DirectionRepeater {
  /**
   * Updates the direction held at `now` (ms), or `undefined` when none is. Returns the
   * direction to emit at this moment: right away on a new direction, then after
   * `REPEAT_DELAY_MS` and every `REPEAT_INTERVAL_MS` while it stays held.
   */
  update: (held: Direction | undefined, now: number) => Direction | undefined
}

export function createDirectionRepeater(): DirectionRepeater {
  let current: Direction | undefined
  let nextAt = 0

  return {
    update(held, now) {
      if (held !== current) {
        current = held
        nextAt = now + REPEAT_DELAY_MS
        return held
      }
      if (held && now >= nextAt) {
        // From now rather than from `nextAt`, so a slow frame doesn't cause a burst.
        nextAt = now + REPEAT_INTERVAL_MS
        return held
      }
      return undefined
    }
  }
}
