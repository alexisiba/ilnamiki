import type { GameFolder, InstalledPlatform } from '@shared/api'

import type { GameConsole } from '@renderer/types/console'

import { findCatalogPlatform } from '../catalog/platformCatalog'

const byName = (a: GameConsole, b: GameConsole): number =>
  a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })

/**
 * The consoles of the library, by name: the installed platforms whose folder has games. The
 * app's catalog names them and gives their year and render; a platform it doesn't know keeps
 * what its cores say.
 */
export function toGameConsoles(
  platforms: InstalledPlatform[],
  folders: GameFolder[]
): GameConsole[] {
  const consoles: GameConsole[] = []
  for (const platform of platforms) {
    const gameCount = folders
      .filter((folder) => folder.platformId === platform.id)
      .reduce((total, folder) => total + folder.gameCount, 0)
    if (gameCount === 0) continue

    const known = findCatalogPlatform(platform.id)
    consoles.push({
      id: platform.id,
      name: known?.name ?? platform.name,
      manufacturer: known?.manufacturer ?? platform.manufacturer,
      releaseYear: known?.releaseYear ?? null,
      imageUrl: known?.imageUrl ?? null,
      gameCount
    })
  }
  return consoles.sort(byName)
}
