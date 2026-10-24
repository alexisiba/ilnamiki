import atari2600Image from '@renderer/assets/images/consoles/atari.png'
import gameBoyAdvanceImage from '@renderer/assets/images/consoles/gba.png'
import gameBoyImage from '@renderer/assets/images/consoles/gb.png'
import gameCubeImage from '@renderer/assets/images/consoles/gc.png'
import nintendo64Image from '@renderer/assets/images/consoles/n64.png'
import nesImage from '@renderer/assets/images/consoles/nes.png'
import playStationImage from '@renderer/assets/images/consoles/ps1.png'
import pspImage from '@renderer/assets/images/consoles/psp.png'
import xboxImage from '@renderer/assets/images/consoles/xbox.png'
import type { GameConsole } from '@renderer/types/console'

/** Sample consoles until the real library exists, in release order. */
export const SAMPLE_CONSOLES: GameConsole[] = [
  {
    id: 'atari-2600',
    name: 'Atari 2600',
    manufacturer: 'Atari',
    releaseYear: 1977,
    imageUrl: atari2600Image,
    gameCount: 38
  },
  {
    id: 'nes',
    name: 'NES',
    manufacturer: 'Nintendo',
    releaseYear: 1985,
    imageUrl: nesImage,
    gameCount: 56
  },
  {
    id: 'gb',
    name: 'Game Boy',
    manufacturer: 'Nintendo',
    releaseYear: 1989,
    imageUrl: gameBoyImage,
    gameCount: 21
  },
  {
    id: 'ps1',
    name: 'PlayStation',
    manufacturer: 'Sony',
    releaseYear: 1994,
    imageUrl: playStationImage,
    gameCount: 24
  },
  {
    id: 'n64',
    name: 'Nintendo 64',
    manufacturer: 'Nintendo',
    releaseYear: 1996,
    imageUrl: nintendo64Image,
    gameCount: 17
  },
  {
    id: 'gba',
    name: 'Game Boy Advance',
    manufacturer: 'Nintendo',
    releaseYear: 2001,
    imageUrl: gameBoyAdvanceImage,
    gameCount: 33
  },
  {
    id: 'gc',
    name: 'GameCube',
    manufacturer: 'Nintendo',
    releaseYear: 2001,
    imageUrl: gameCubeImage,
    gameCount: 12
  },
  {
    id: 'xbox',
    name: 'Xbox',
    manufacturer: 'Microsoft',
    releaseYear: 2001,
    imageUrl: xboxImage,
    gameCount: 9
  },
  {
    id: 'psp',
    name: 'PSP',
    manufacturer: 'Sony',
    releaseYear: 2004,
    imageUrl: pspImage,
    gameCount: 15
  }
]

export function getSampleConsole(id: string): GameConsole | undefined {
  return SAMPLE_CONSOLES.find((gameConsole) => gameConsole.id === id)
}
