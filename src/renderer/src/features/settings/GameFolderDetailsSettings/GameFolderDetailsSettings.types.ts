import type { FolderGame } from '@shared/api'

import type { GameFolder } from '@renderer/types/gameFolder'

import type { FolderScanProblem } from '../utils/gameFolderProblems'

export interface FolderPathProps {
  folder: GameFolder
  /** Why the folder couldn't be scanned again, if it couldn't. */
  problem: FolderScanProblem | undefined
}

export interface FolderGamesProps {
  folderId: string
}

export interface FolderGameItemProps {
  game: FolderGame
}
