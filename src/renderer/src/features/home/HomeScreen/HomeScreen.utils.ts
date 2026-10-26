import type { InstalledPlatform, LastPlayedGame, RecentlyAddedGame } from '@shared/api'

import consolesArtwork from '@renderer/assets/images/consoles/consoles.webp'
import noImage from '@renderer/assets/images/games/no-image.webp'
import { findCatalogPlatform } from '@renderer/utils/platformCatalog/platformCatalog'

import type { ContinueGame } from './components/ContinueHero'
import type { ShelfGame } from './components/GameShelf'

const MINUTE_MS = 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_DAYS = 7

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/**
 * The last played game as the hero shows it. Until games have metadata, it has no description
 * and shows its console's render (or Home's consoles artwork when the console has none); the
 * console is named as the app's catalog names it, or as its cores do.
 */
export function toContinueGame(game: LastPlayedGame, platforms: InstalledPlatform[]): ContinueGame {
  return {
    id: game.id,
    title: game.title,
    platform: platformName(game.platformId, platforms),
    description: null,
    imageUrl: findCatalogPlatform(game.platformId)?.imageUrl ?? consolesArtwork,
    lastPlayedAt: new Date(game.lastPlayedAt),
    playtimeMinutes: Math.round(game.playtimeMs / MINUTE_MS)
  }
}

/**
 * A recently added game as its shelf shows it: until games have artwork, with the generic
 * game image, and its console named as in the hero.
 */
export function toRecentlyAddedShelfGame(
  game: RecentlyAddedGame,
  platforms: InstalledPlatform[]
): ShelfGame {
  return {
    id: game.id,
    title: game.title,
    platform: platformName(game.platformId, platforms),
    imageUrl: noImage
  }
}

/** The console `platformId` as the app's catalog names it, or as its cores do, or its id. */
function platformName(platformId: string, platforms: InstalledPlatform[]): string {
  const installed = platforms.find((platform) => platform.id === platformId)
  return findCatalogPlatform(platformId)?.name ?? installed?.name ?? platformId
}

/**
 * Short "last played" label: the time if today, "yesterday", the weekday within the last
 * week, and the date otherwise (with the year only when it is not the current one).
 */
export function formatLastPlayed(date: Date, now: Date, locale: string): string {
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)

  if (daysAgo <= 0) {
    return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date)
  }
  if (daysAgo === 1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day')
  }
  if (daysAgo < WEEK_DAYS) {
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric'
  }).format(date)
}
