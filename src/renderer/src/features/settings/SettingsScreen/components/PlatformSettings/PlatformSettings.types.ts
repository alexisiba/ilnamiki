import type { AssociatedPlatform } from '@renderer/types/associatedPlatform'

export interface PlatformSettingsProps {
  platforms: AssociatedPlatform[]
  /** Takes the user to the emulators, where platforms come from. */
  onSetUpEmulator: () => void
}

export interface PlatformListItemProps {
  platform: AssociatedPlatform
}
