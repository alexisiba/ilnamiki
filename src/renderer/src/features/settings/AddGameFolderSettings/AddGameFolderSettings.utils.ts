import type { AddFolderProblem, ScanFolderProblem } from '@shared/api'

/**
 * Why a folder couldn't be scanned, as the form explains it below the path: what main
 * reports (a cancelled scan is never shown), a path that isn't absolute, or a failure to
 * reach main.
 */
export type FolderScanProblem = Exclude<ScanFolderProblem, 'cancelled'> | 'relative-path' | 'failed'

/** Why a scanned folder couldn't be saved: what main reports, or a failure to reach main. */
export type FolderSaveProblem = AddFolderProblem | 'failed'

const SCAN_MESSAGE_KEYS: Record<FolderScanProblem, string> = {
  'relative-path': 'addGameFolder.problems.relativePath',
  'not-found': 'addGameFolder.problems.notFound',
  'not-a-folder': 'addGameFolder.problems.notAFolder',
  'not-readable': 'addGameFolder.problems.notReadable',
  'unknown-platform': 'addGameFolder.problems.unknownPlatform',
  'already-added': 'addGameFolder.problems.alreadyAdded',
  'platform-has-folder': 'addGameFolder.problems.platformHasFolder',
  failed: 'addGameFolder.problems.failed'
}

const SAVE_MESSAGE_KEYS: Record<FolderSaveProblem, string> = {
  'unknown-scan': 'folderScan.saveProblems.unknownScan',
  'already-added': 'folderScan.saveProblems.alreadyAdded',
  'platform-has-folder': 'folderScan.saveProblems.platformHasFolder',
  'no-games': 'folderScan.saveProblems.noGames',
  failed: 'folderScan.saveProblems.failed'
}

/** The key, in the `settings` namespace, of the message that explains a scan's `problem`. */
export function scanProblemMessageKey(problem: FolderScanProblem): string {
  return SCAN_MESSAGE_KEYS[problem]
}

/** The key, in the `settings` namespace, of the message that explains a save's `problem`. */
export function saveProblemMessageKey(problem: FolderSaveProblem): string {
  return SAVE_MESSAGE_KEYS[problem]
}
