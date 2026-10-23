import { useState } from 'react'

import { getSectionPath } from './sections'

/**
 * The screen each section was last left on, given the current `pathname`, so switching back
 * to a section returns to that screen instead of to the section's root.
 */
export function useLastSectionPaths(pathname: string): (sectionPath: string) => string {
  const [lastPaths, setLastPaths] = useState<Record<string, string>>({})
  const currentSection = getSectionPath(pathname)

  // Adjusting state while rendering: it follows the current screen without an extra effect.
  if (lastPaths[currentSection] !== pathname) {
    setLastPaths({ ...lastPaths, [currentSection]: pathname })
  }

  return (sectionPath) =>
    sectionPath === currentSection ? pathname : (lastPaths[sectionPath] ?? sectionPath)
}
