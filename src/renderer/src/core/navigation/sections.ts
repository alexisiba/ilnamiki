/** Paths of the top-level sections, shared by the router and the top bar. */
export const SECTION_PATHS = {
  home: '/',
  library: '/library',
  settings: '/settings'
} as const

const SECTION_ROOTS: readonly string[] = Object.values(SECTION_PATHS)

/** Whether `pathname` is the root of a top-level section, where there is nothing to go back to. */
export function isSectionRoot(pathname: string): boolean {
  return SECTION_ROOTS.includes(pathname)
}
