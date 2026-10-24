import type { Game } from '@renderer/types/game'

interface GameCarouselBaseProps {
  games: Game[]
  selectedIndex: number
  onSelect: (index: number) => void
}

/** Focus stays elsewhere (e.g. on Play now): directions and clicks only select games. */
interface SelectOnlyGameCarouselProps extends GameCarouselBaseProps {
  /** Id for the status that announces the selected game, e.g. to describe Play now. */
  statusId: string
  focusGroupId?: never
  onOpen?: never
  focusOnShow?: never
}

/** The games take focus, and the focused one is the selected one. */
interface FocusableGameCarouselProps extends GameCarouselBaseProps {
  statusId?: never
  /** Focus group of the games, so focus returns to the last one when coming back. */
  focusGroupId: string
  /** Confirming the selected game, or clicking it, opens it. */
  onOpen: (game: Game) => void
  /** Moves focus to the selected game as soon as the carousel is shown. */
  focusOnShow?: boolean
}

export type GameCarouselProps = SelectOnlyGameCarouselProps | FocusableGameCarouselProps

export interface GameCarouselItemProps {
  game: Game
  /** Whether it is the game in front. */
  selected: boolean
  onSelect: () => void
}

export interface FocusableGameCarouselItemProps extends GameCarouselItemProps {
  /** Takes focus when shown. */
  focusOnShow: boolean
  /** Id of the selected game's facts, which describe it. */
  describedBy?: string
  onOpen: () => void
}

export interface GameCarouselCoverProps {
  game: Game
}
