import type { GameFolder } from '@renderer/types/gameFolder'

export interface GameFolderSettingsProps {
  folders: GameFolder[]
  /** Whether any platform has an installed core, without which no folder's games can play. */
  hasInstalledPlatforms: boolean
  /** Takes the user to the emulators, where cores come from. */
  onSetUpEmulator: () => void
}

export interface GameFolderListItemProps {
  folder: GameFolder
}
