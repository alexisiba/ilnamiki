import type { AssociatedPlatform } from '@renderer/types/associatedPlatform'

export interface GameFolderFormProps {
  /** The platforms a folder's games can belong to: those with an installed core. */
  platforms: AssociatedPlatform[]
  /** Leaves the form without adding anything. */
  onCancel: () => void
}
