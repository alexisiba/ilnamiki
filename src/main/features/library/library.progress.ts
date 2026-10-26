import type { ScanProgress } from '@shared/api'

/** The two steps of reading a folder, each half of a scan. */
export type ScanStep =
  /** Listing the files of its subfolders. */
  | 'listing'
  /** Reading the playlists, cue sheets and .gdi found. */
  | 'reading'

/**
 * The fraction of a scan done (0–1) after `done` of `total` items of `step`. A step without
 * items is done at once.
 */
export function scanFraction(step: ScanStep, done: number, total: number): number {
  const stepFraction = total === 0 ? 1 : Math.min(done / total, 1)
  return step === 'listing' ? stepFraction / 2 : 0.5 + stepFraction / 2
}

/**
 * A function to report a scan's fraction done, which calls `send` only when the whole
 * percent grows, so progress is sent at most a hundred times and never goes back.
 */
export function createProgressReporter(
  send: (progress: ScanProgress) => void
): (fraction: number) => void {
  let last = -1
  return (fraction) => {
    const percent = Math.floor(Math.min(Math.max(fraction, 0), 1) * 100)
    if (percent <= last) return
    last = percent
    send({ percent })
  }
}
