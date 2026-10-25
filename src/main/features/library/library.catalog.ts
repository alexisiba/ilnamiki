/**
 * Extensions a platform's cores play that aren't games, by platform id: they are never listed
 * as games. Lowercase, without the dot.
 */
const IGNORED_EXTENSIONS: Record<string, string[]> = {
  // Executables (homebrew and test programs) and sound files.
  playstation: ['exe', 'psexe', 'psf']
}

/**
 * The extensions of `platformId`'s games: those its cores play (`coreExtensions`, lowercase)
 * without the ones that aren't games.
 */
export function gameExtensionsOf(platformId: string, coreExtensions: string[]): Set<string> {
  const ignored = new Set(IGNORED_EXTENSIONS[platformId] ?? [])
  return new Set(coreExtensions.filter((extension) => !ignored.has(extension)))
}
