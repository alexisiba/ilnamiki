import type { FolderGame } from '@shared/api'

import type { GameFolder } from '@renderer/types/gameFolder'

import type { FolderScanProblem } from '../utils/gameFolderProblems'

export interface FolderPathProps {
  folder: GameFolder
  /** Why the folder couldn't be scanned again, or moved, if it couldn't. */
  problem: FolderScanProblem | undefined
  /** Change path was pressed. */
  onChangePath: () => void
}

export interface RemoveFolderProps {
  folder: GameFolder
  /** The name of the folder's platform, as the screen's title shows it. */
  platformName: string
  /** Called once the folder is removed. */
  onRemoved: () => void
}

export interface FolderGamesProps {
  folderId: string
}

export interface FolderGameItemProps {
  game: FolderGame
}
