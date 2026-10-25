import type { InstalledPlatform } from '@renderer/types/installedPlatform'

export interface GameFolderFormProps {
  /** The platforms a folder's games can belong to: those with an installed core. */
  platforms: InstalledPlatform[]
  /** Leaves the form without adding anything. */
  onCancel: () => void
}
