import type { ScannedGame, ScanFolderResult } from '@shared/api'

import type { FolderSaveProblem, FolderScanProblem } from '../../utils/gameFolderProblems'

/** What saving a scan answers: done, or why it couldn't be saved. */
export type FolderScanSaveResult = { ok: true } | { ok: false; problem: FolderSaveProblem }

export interface FolderScanResultsProps {
  /** Absolute path of the folder scanned, shown with its platform. */
  path: string
  /** Name of the platform, shown with the folder. */
  platformName: string
  /** Starts the scan, once, when the results show. */
  scan: () => Promise<ScanFolderResult>
  /** Saves what the scan with the id given found. */
  save: (scanId: string) => Promise<FolderScanSaveResult>
  /** The label of the action that saves, e.g. "Save folder". */
  saveLabel: string
  /** Returns to the previous step, cancelling the scan if it still runs. */
  onBack: () => void
  /** The folder couldn't be scanned: the previous step shows why. */
  onFailed: (problem: FolderScanProblem) => void
  /** What the scan found was saved. */
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
