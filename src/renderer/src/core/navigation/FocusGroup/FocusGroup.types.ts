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
  /**
   * How directions move between its items. `spatial` (the default) goes to the closest item
   * that way, keeping the column, as shelves and grids need. `rows`, for a screen read top to
   * bottom (a form, a details screen), goes up and down row by row, to the item last focused
   * in the row (else its first), and left and right only within the row.
   */
  movement?: 'spatial' | 'rows'
  /**
   * Whether directions keep focus inside the group: at its edges focus stays instead of
   * moving to another group. For groups entered and left with confirm and back instead,
   * e.g. a list of categories and the content beside it.
   */
  contained?: boolean
  className?: string
  children: ReactNode
}
