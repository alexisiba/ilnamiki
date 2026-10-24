import type { GameConsole } from '@renderer/types/console'

export interface ConsoleCarouselProps {
  /** Consoles in carousel order; the first one is selected when the carousel opens. */
  consoles: GameConsole[]
  /** Opens the selected console, when it is confirmed or clicked. */
  onOpenConsole: (consoleId: string) => void
}

export interface ConsoleCarouselItemProps {
  gameConsole: GameConsole
  /** Whether it is the console in front. */
  selected: boolean
  autoFocus: boolean
  /** Id of the element that describes the console, only while it is selected. */
  describedBy?: string
  onFocus: () => void
  onOpen: () => void
}
