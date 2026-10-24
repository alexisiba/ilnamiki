import type { ReactNode } from 'react'

export interface FocusGroupProps {
  /** Unique across the app; the group remembers its last focused item. */
  id: string
  /** Element rendered as the group container. */
  as?: 'div' | 'section'
  /**
   * How the focused item is scrolled inside its scroll container: `start` keeps it pinned to
   * the start (e.g. a shelf sliding under a fixed focus), `nearest` scrolls only when needed.
   */
  scrollAlign?: 'nearest' | 'start'
  className?: string
  children: ReactNode
}
