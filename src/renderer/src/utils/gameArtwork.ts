import type { GameArtwork } from '@shared/api'

import noScreenshot from '@renderer/assets/images/games/no-bg-image.webp'
import noImage from '@renderer/assets/images/games/no-image.webp'

/** The image shown behind a game, and how to draw it. */
export interface GameBackdrop {
  url: string
  /**
   * Whether it is a capture of the game at the console's own resolution, which is drawn with
   * sharp pixels rather than blurred when it is stretched.
   */
  isPixelArt: boolean
}

/**
 * What shows behind a game: its screenshot, else its title screen, else a generic image while
 * it has neither.
 */
export function backdropOf(artwork: GameArtwork): GameBackdrop {
  const capture = artwork.screenshot ?? artwork.titleScreen
  return capture ? { url: capture, isPixelArt: true } : { url: noScreenshot, isPixelArt: false }
}

/** What shows on a game's card: its cover, else a generic image while it has none. */
export const coverOf = (artwork: GameArtwork): string => artwork.cover ?? noImage
