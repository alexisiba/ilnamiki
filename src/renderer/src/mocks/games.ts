import donkeyKong64Artwork from '@renderer/assets/images/dk-64.jpg'
import metalGearSolidArtwork from '@renderer/assets/images/mgs-ps1.jpeg'
import monsterHunterArtwork from '@renderer/assets/images/mh-fu-psp.jpeg'
import superMarioBros3Artwork from '@renderer/assets/images/smb3-nes.jpeg'
import spyroArtwork from '@renderer/assets/images/spyro-ps1.jpeg'
import tonyHawkArtwork from '@renderer/assets/images/thps-u2-ps2.jpeg'
import ocarinaOfTimeArtwork from '@renderer/assets/images/tloz-oc-gameplay.webp'
import type { Game } from '@renderer/types/game'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const ago = (ms: number): Date => new Date(Date.now() - ms)

/** Sample library until the real one exists. */
export const SAMPLE_GAMES: Game[] = [
  {
    id: 'tloz-oot-n64',
    title: 'The Legend of Zelda: Ocarina of Time',
    platform: 'Nintendo 64',
    imageUrl: ocarinaOfTimeArtwork,
    releaseYear: 1998,
    genre: 'Action-adventure',
    players: 1,
    description:
      'Travel through time as Link to stop Ganondorf from claiming the Triforce and plunging Hyrule into darkness.',
    lastPlayedAt: ago(2 * DAY_MS),
    playtimeMinutes: 32 * 60 + 15
  },
  {
    id: 'dk-64',
    title: 'Donkey Kong 64',
    platform: 'Nintendo 64',
    imageUrl: donkeyKong64Artwork,
    releaseYear: 1999,
    genre: 'Platformer',
    players: 4,
    description:
      'King K. Rool has kidnapped the Kong family. Swap between five Kongs to rescue them and recover the stolen golden bananas.',
    lastPlayedAt: ago(1 * HOUR_MS),
    playtimeMinutes: 14 * 60 + 40
  },
  {
    id: 'smb3-nes',
    title: 'Super Mario Bros. 3',
    platform: 'NES',
    imageUrl: superMarioBros3Artwork,
    releaseYear: 1988,
    genre: 'Platformer',
    players: 2,
    description:
      'Bowser has stolen the magic wands of the Mushroom World kings. Cross eight worlds with new power-ups like the Super Leaf to win them back.',
    lastPlayedAt: ago(1 * DAY_MS),
    playtimeMinutes: 6 * 60 + 5
  },
  {
    id: 'mgs-ps1',
    title: 'Metal Gear Solid',
    platform: 'PlayStation',
    imageUrl: metalGearSolidArtwork,
    releaseYear: 1998,
    genre: 'Stealth action',
    players: 1,
    description:
      'Infiltrate a nuclear weapons facility as Solid Snake and stop a rogue special forces unit from launching a nuclear strike.',
    lastPlayedAt: ago(3 * DAY_MS),
    playtimeMinutes: 18 * 60 + 40
  },
  {
    id: 'spyro-ps1',
    title: 'Spyro the Dragon',
    platform: 'PlayStation',
    imageUrl: spyroArtwork,
    releaseYear: 1998,
    genre: 'Platformer',
    players: 1,
    description:
      'Gnasty Gnorc has turned the dragons into crystal. Glide, charge and breathe fire across six worlds to free them.',
    lastPlayedAt: ago(5 * DAY_MS),
    playtimeMinutes: 9 * 60 + 30
  },
  {
    id: 'thps-u2-ps2',
    title: "Tony Hawk's Underground 2",
    platform: 'PlayStation 2',
    imageUrl: tonyHawkArtwork,
    releaseYear: 2004,
    genre: 'Sports',
    players: 2,
    description:
      'Join the World Destruction Tour and skate, trick and wreck your way through cities around the world.',
    lastPlayedAt: ago(12 * DAY_MS),
    playtimeMinutes: 21 * 60
  },
  {
    id: 'mh-fu-psp',
    title: 'Monster Hunter Freedom Unite',
    platform: 'PSP',
    imageUrl: monsterHunterArtwork,
    releaseYear: 2008,
    genre: 'Action RPG',
    players: 4,
    description:
      'Hunt colossal monsters, craft gear from their materials and take on ever tougher quests from Pokke Village.',
    lastPlayedAt: ago(40 * DAY_MS),
    playtimeMinutes: 112 * 60 + 25
  }
]
