import type { ReactNode } from 'react'

export interface CarouselProps {
  /** Index of the item shown in front; the carousel stops at both ends. */
  selectedIndex: number
  /** Distance between the centers of neighboring items, e.g. `var(--console-spacing)`. */
  spacing: string
  /** One keyed element per item, in order. Each item styles its own selected state. */
  children: ReactNode
  /** Content about the selected item, between the items and the position indicator. */
  details?: ReactNode
  /** Extra class for the element the items slide in, e.g. for a backdrop behind them. */
  stageClassName?: string
}

export interface CarouselIndicatorProps {
  count: number
  selectedIndex: number
}
