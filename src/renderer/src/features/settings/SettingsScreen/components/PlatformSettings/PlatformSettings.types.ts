import type { InstalledPlatform } from '@renderer/types/installedPlatform'

export interface PlatformSettingsProps {
  /** Takes the user to the emulators, where platforms come from. */
  onSetUpEmulator: () => void
}

export interface PlatformListItemProps {
  platform: InstalledPlatform
}
