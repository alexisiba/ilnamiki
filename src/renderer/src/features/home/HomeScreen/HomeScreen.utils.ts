import type { InstalledPlatform, LastPlayedGame } from '@shared/api'

import consolesArtwork from '@renderer/assets/images/consoles/consoles.webp'
import { findCatalogPlatform } from '@renderer/utils/platformCatalog/platformCatalog'

import type { ContinueGame } from './components/ContinueHero'

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
  const known = findCatalogPlatform(game.platformId)
  const installed = platforms.find((platform) => platform.id === game.platformId)

  return {
    id: game.id,
    title: game.title,
    platform: known?.name ?? installed?.name ?? game.platformId,
    description: null,
    imageUrl: known?.imageUrl ?? consolesArtwork,
    lastPlayedAt: new Date(game.lastPlayedAt),
    playtimeMinutes: Math.round(game.playtimeMs / MINUTE_MS)
  }
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
