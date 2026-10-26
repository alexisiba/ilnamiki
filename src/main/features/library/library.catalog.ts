/**
 * Extensions a platform's cores play that aren't games, by platform id: they are never listed
 * as games. Lowercase, without the dot.
 */
const IGNORED_EXTENSIONS: Record<string, string[]> = {
  // Executables (homebrew and test programs) and sound files.
  playstation: ['exe', 'psexe', 'psf']
}

/**
 * Archives of a game, e.g. "Super Mario 64 (USA).zip". Cores don't declare them: RetroArch
 * opens them and hands the core the game inside. For now every archive in a platform's folder
 * is taken as one of its games, without looking inside.
 */
const ARCHIVE_EXTENSIONS = ['zip', '7z']

/**
 * The extensions of `platformId`'s games: those its cores play (`coreExtensions`, lowercase)
 * and archives, without the ones that aren't games.
 */
export function gameExtensionsOf(platformId: string, coreExtensions: string[]): Set<string> {
  const ignored = new Set(IGNORED_EXTENSIONS[platformId] ?? [])
  return new Set(
    [...coreExtensions, ...ARCHIVE_EXTENSIONS].filter((extension) => !ignored.has(extension))
  )
}
