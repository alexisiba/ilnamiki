import type { ScannedGame, ScanFolderRequest } from '@shared/api'

import type { FolderScanProblem } from '../../AddGameFolderSettings.utils'

export interface FolderScanResultsProps {
  /** The folder to scan and its platform. */
  request: ScanFolderRequest
  /** Name of the platform, shown with the folder. */
  platformName: string
  /** Returns to the form, cancelling the scan if it still runs. */
  onBack: () => void
  /** The folder couldn't be scanned: the form shows why. */
  onFailed: (problem: FolderScanProblem) => void
  /** The folder was saved. */
  onSaved: () => void
}

export interface ScanProgressBarProps {
  /** 0–100. */
  percent: number
  /** Id of the heading that names the progress. */
  labelId: string
}

export interface ScanSummaryProps {
  games: ScannedGame[]
  playableCount: number
}

export interface ScannedGameItemProps {
  game: ScannedGame
}
