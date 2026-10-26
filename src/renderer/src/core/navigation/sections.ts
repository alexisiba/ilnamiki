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

/** Route of a console's games, inside the Library section. */
export const CONSOLE_GAMES_PATH = `${SECTION_PATHS.library}/:consoleId`

export function getConsoleGamesPath(consoleId: string): string {
  return `${SECTION_PATHS.library}/${encodeURIComponent(consoleId)}`
}

/** Route of the form that adds an emulator, inside the Settings section. */
export const ADD_EMULATOR_PATH = `${SECTION_PATHS.settings}/emulators/new`

/** Route of an emulator's details, inside the Settings section. */
export const EMULATOR_DETAILS_PATH = `${SECTION_PATHS.settings}/emulators/:emulatorId`

export function getEmulatorDetailsPath(emulatorId: string): string {
  return `${SECTION_PATHS.settings}/emulators/${encodeURIComponent(emulatorId)}`
}

/** Route of the form that adds a game folder, inside the Settings section. */
export const ADD_GAME_FOLDER_PATH = `${SECTION_PATHS.settings}/game-folders/new`

/** Route of a game folder's details, inside the Settings section. */
export const GAME_FOLDER_DETAILS_PATH = `${SECTION_PATHS.settings}/game-folders/:folderId`

export function getGameFolderDetailsPath(folderId: string): string {
  return `${SECTION_PATHS.settings}/game-folders/${encodeURIComponent(folderId)}`
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
