import type { ScanFolderRequest } from '@shared/api'

import type { InstalledPlatform } from '@renderer/types/installedPlatform'

export interface GameFolderFormProps {
  /** The platforms a folder's games can belong to: those with an installed core and no folder. */
  platforms: InstalledPlatform[]
  /** The path the form starts with, e.g. the one scanned before going back to the form. */
  initialPath: string
  /** The platform the form starts with; `undefined` for none. */
  initialPlatformId: string | undefined
  /** Why the folder couldn't be scanned, shown below its path until the user changes it. */
  problemMessage: string | undefined
  /** Leaves the form without adding anything. */
  onCancel: () => void
  /** Scans the folder for the platform, both filled in. */
  onScan: (request: ScanFolderRequest) => void
}
