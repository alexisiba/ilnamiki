import { ignoredExtensionsOf } from '@shared/platformCatalog'

/**
 * The extensions of `platformId`'s games: those its emulators play (`emulatorExtensions`,
 * lowercase), without the ones the platform catalog says are never games. Archives (e.g. ZIP
 * or 7z) are games only when an emulator declares them: RetroArch can open others too, but it
 * extracts them first, which fails or takes long for large games.
 */
export function gameExtensionsOf(platformId: string, emulatorExtensions: string[]): Set<string> {
  const ignored = new Set(ignoredExtensionsOf(platformId))
  return new Set(emulatorExtensions.filter((extension) => !ignored.has(extension)))
}
