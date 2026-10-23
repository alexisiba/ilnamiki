import ocarinaOfTimeArtwork from '@renderer/assets/images/tloz-oc-gameplay.webp'

import type { LastPlayedGame } from './components/HomeHero'

const DAY_MS = 24 * 60 * 60 * 1000

/** Sample data until the library exists. Set to `null` to see the empty state. */
export const SAMPLE_LAST_PLAYED_GAME: LastPlayedGame | null = {
  title: 'The Legend of Zelda: Ocarina of Time',
  platform: 'Nintendo 64',
  description:
    'Travel through time as Link to stop Ganondorf from claiming the Triforce and plunging Hyrule into darkness.',
  imageUrl: ocarinaOfTimeArtwork,
  lastPlayedAt: new Date(Date.now() - 2 * DAY_MS),
  playtimeMinutes: 32 * 60 + 15
}
