import gameCubeImage from '@renderer/assets/images/consoles/gc.png'
import playStationImage from '@renderer/assets/images/consoles/ps1.png'
import type { GameConsole } from '@renderer/types/console'

/** Sample consoles until the real library exists, in release order. */
export const SAMPLE_CONSOLES: GameConsole[] = [
  {
    id: 'ps1',
    name: 'PlayStation',
    manufacturer: 'Sony',
    releaseYear: 1994,
    imageUrl: playStationImage,
    gameCount: 24
  },
  {
    id: 'gc',
    name: 'GameCube',
    manufacturer: 'Nintendo',
    releaseYear: 2001,
    imageUrl: gameCubeImage,
    gameCount: 12
  }
]
