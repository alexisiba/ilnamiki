import type { GameConsole } from '@renderer/types/console'

export interface ConsoleCarouselProps {
  /** Consoles in carousel order; the first one is selected when the carousel opens. */
  consoles: GameConsole[]
}

export interface ConsoleCarouselItemProps {
  gameConsole: GameConsole
  /** Position relative to the selected console: 0 is the selected one, -1 the one before it. */
  offset: number
  autoFocus: boolean
  /** Id of the element that describes the console, only while it is selected. */
  describedBy?: string
  onFocus: () => void
}

export interface ConsoleCarouselDotsProps {
  count: number
  selectedIndex: number
}
