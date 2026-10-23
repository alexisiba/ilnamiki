import donkeyKong64Artwork from '@renderer/assets/images/dk-64.jpg'
import metalGearSolidArtwork from '@renderer/assets/images/mgs-ps1.jpeg'
import monsterHunterArtwork from '@renderer/assets/images/mh-fu-psp.jpeg'
import superMarioBros3Artwork from '@renderer/assets/images/smb3-nes.jpeg'
import spyroArtwork from '@renderer/assets/images/spyro-ps1.jpeg'
import tonyHawkArtwork from '@renderer/assets/images/thps-u2-ps2.jpeg'
import ocarinaOfTimeArtwork from '@renderer/assets/images/tloz-oc-gameplay.webp'

import type { LastPlayedGame } from './components/HomeHero'
import type { RecentGame } from './components/RecentlyPlayed'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const ago = (ms: number): Date => new Date(Date.now() - ms)

/** Sample data until the library exists. Set to `null` to see the empty state. */
export const SAMPLE_LAST_PLAYED_GAME: LastPlayedGame | null = {
  title: 'The Legend of Zelda: Ocarina of Time',
  platform: 'Nintendo 64',
  description:
    'Travel through time as Link to stop Ganondorf from claiming the Triforce and plunging Hyrule into darkness.',
  imageUrl: ocarinaOfTimeArtwork,
  lastPlayedAt: ago(2 * DAY_MS),
  playtimeMinutes: 32 * 60 + 15
}

/** Sample data until the library exists. */
export const SAMPLE_RECENT_GAMES: RecentGame[] = [
  {
    id: 'dk-64',
    title: 'Donkey Kong 64',
    platform: 'Nintendo 64',
    imageUrl: donkeyKong64Artwork,
    lastPlayedAt: ago(1 * HOUR_MS)
  },
  {
    id: 'smb3-nes',
    title: 'Super Mario Bros. 3',
    platform: 'NES',
    imageUrl: superMarioBros3Artwork,
    lastPlayedAt: ago(1 * DAY_MS)
  },
  {
    id: 'mgs-ps1',
    title: 'Metal Gear Solid',
    platform: 'PlayStation',
    imageUrl: metalGearSolidArtwork,
    lastPlayedAt: ago(3 * DAY_MS)
  },
  {
    id: 'spyro-ps1',
    title: 'Spyro the Dragon',
    platform: 'PlayStation',
    imageUrl: spyroArtwork,
    lastPlayedAt: ago(5 * DAY_MS)
  },
  {
    id: 'thps-u2-ps2',
    title: "Tony Hawk's Underground 2",
    platform: 'PlayStation 2',
    imageUrl: tonyHawkArtwork,
    lastPlayedAt: ago(12 * DAY_MS)
  },
  {
    id: 'mh-fu-psp',
    title: 'Monster Hunter Freedom Unite',
    platform: 'PSP',
    imageUrl: monsterHunterArtwork,
    lastPlayedAt: ago(40 * DAY_MS)
  }
]
