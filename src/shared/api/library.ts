/** Why a game found in a folder can't be played. */
export type ScannedGameProblem =
  /** Files the game's index (e.g. its .cue) points to aren't there, as the index writes them. */
  | { kind: 'missing-files'; files: string[] }
  /** The game's index points to no file, or couldn't be read. */
  | { kind: 'empty-index' }

/** A game found by scanning a folder. Its data comes from the files and is never translated. */
export interface ScannedGame {
  /** Its file's name without the extension, e.g. "Crash Bandicoot (USA)". */
  title: string
  /** The file the emulator opens, relative to the folder, with `/` separators. */
  relativePath: string
  /** Why it can't be played, or null when it can. */
  problem: ScannedGameProblem | null
}

export interface ScanFolderRequest {
  /** Absolute path of the folder of games. */
  path: string
  /** The installed platform its games belong to, e.g. "playstation". */
  platformId: string
}

/** What a scan found in a folder. */
export interface FolderScan {
  /** Identifies this scan, to save its result later. */
  id: string
  /** Absolute path of the folder. */
  path: string
  platformId: string
  /**
   * The games at the folder's top and at the top of its subfolders, by title, playable or not.
   */
  games: ScannedGame[]
}

/** Why a folder couldn't be scanned. */
export type ScanFolderProblem =
  /** Nothing exists at the path. */
  | 'not-found'
  /** The path is a file, not a folder. */
  | 'not-a-folder'
  /** The folder isn't allowed to be read. */
  | 'not-readable'
  /** No installed core plays the platform (e.g. it was uninstalled). */
  | 'unknown-platform'
  /** The scan was cancelled, or replaced by a newer one. */
  | 'cancelled'

export type ScanFolderResult =
  { ok: true; scan: FolderScan } | { ok: false; problem: ScanFolderProblem }

/** How far the running scan is. */
export interface ScanProgress {
  /** 0–100, never going back. */
  percent: number
}

/** The user's game library: the folders games are found in. */
export interface LibraryApi {
  /**
   * Asks the user to choose a folder of games with the system's folder picker, which only
   * lets folders be chosen. Resolves with its absolute path, or null when the user cancels.
   */
  pickFolder(): Promise<string | null>
  /**
   * Finds the games in a folder for a platform, reporting its progress with `onScanProgress`,
   * or says why it can't. One scan runs at a time: starting one cancels the one running.
   */
  scanFolder(request: ScanFolderRequest): Promise<ScanFolderResult>
  /** Cancels the running scan, which then resolves as `cancelled`; nothing when none runs. */
  cancelScan(): Promise<void>
  /** Calls `listener` as the running scan advances. Returns the unsubscribe function. */
  onScanProgress(listener: (progress: ScanProgress) => void): () => void
}

export const LIBRARY_CHANNELS = {
  pickFolder: 'library:pick-folder',
  scanFolder: 'library:scan-folder',
  cancelScan: 'library:cancel-scan',
  scanProgress: 'library:scan-progress'
} as const
