import type { GameFolder } from '@renderer/types/gameFolder'

export interface GameFolderSettingsProps {
  /** Takes the user to the emulators, where cores come from. */
  onSetUpEmulator: () => void
  /** Opens the form that adds a game folder. */
  onAdd: () => void
  /** Opens the details of the folder with the id given. */
  onOpen: (folderId: string) => void
}

export interface GameFolderListItemProps {
  folder: GameFolder
  /** Name of the folder's platform, e.g. "PlayStation". */
  platformName: string
  /** Opens the folder's details. */
  onOpen: () => void
}
