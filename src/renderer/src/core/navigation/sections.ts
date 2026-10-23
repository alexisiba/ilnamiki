/** Paths of the top-level sections, shared by the router and the top bar. */
export const SECTION_PATHS = {
  home: '/',
  library: '/library',
  settings: '/settings'
} as const

/** Route of a game's details screen, inside the Home section. */
export const GAME_DETAILS_PATH = '/games/:gameId'

export function getGameDetailsPath(gameId: string): string {
  return `/games/${encodeURIComponent(gameId)}`
}

const SECTION_ROOTS: readonly string[] = Object.values(SECTION_PATHS)

/** Whether `pathname` is the root of a top-level section, where there is nothing to go back to. */
export function isSectionRoot(pathname: string): boolean {
  return SECTION_ROOTS.includes(pathname)
}

/**
 * The root path of the section `pathname` belongs to: a section's own screens live under its
 * root (e.g. `/settings/...`), and any other screen, such as a game's details, belongs to Home.
 */
export function getSectionPath(pathname: string): string {
  return (
    SECTION_ROOTS.find(
      (root) =>
        root !== SECTION_PATHS.home && (pathname === root || pathname.startsWith(`${root}/`))
    ) ?? SECTION_PATHS.home
  )
}
