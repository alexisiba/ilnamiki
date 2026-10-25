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
  /** The folder was already added. */
  | 'already-added'
  /** The platform already has a folder: each platform has one at most. */
  | 'platform-has-folder'
  /** The scan was cancelled, or replaced by a newer one. */
  | 'cancelled'
  /** Scanning a folder again: it isn't one of the user's folders (e.g. it was removed). */
  | 'unknown-folder'

export type ScanFolderResult =
  { ok: true; scan: FolderScan } | { ok: false; problem: ScanFolderProblem }

/** A folder the user added for Ilnamiki to find a platform's games in. */
export interface GameFolder {
  id: string
  /** Absolute path of the folder. */
  path: string
  /** The platform its games belong to, e.g. "playstation"; one folder per platform. */
  platformId: string
  /** How many playable games were saved from it. */
  gameCount: number
  /** Whether the folder is still there; false when it was moved or deleted, or its drive is out. */
  isAvailable: boolean
  /** When it was added, in milliseconds since the epoch. */
  addedAt: number
}

/** Why a scanned folder couldn't be added. */
export type AddFolderProblem =
  /** The scan isn't the latest one (a newer scan replaced it), or never existed. */
  | 'unknown-scan'
  | 'already-added'
  | 'platform-has-folder'
  /** The scan found no playable game. */
  | 'no-games'

export type AddFolderResult =
  { ok: true; folder: GameFolder } | { ok: false; problem: AddFolderProblem }

/** Why a folder scanned again couldn't be updated. */
export type UpdateFolderProblem =
  /** The scan isn't the latest one (a newer scan replaced it), or never existed. */
  | 'unknown-scan'
  /** The folder isn't one of the user's folders anymore (e.g. it was removed). */
  | 'unknown-folder'
  /** The scan found no playable game. */
  | 'no-games'

export type UpdateFolderResult =
  { ok: true; folder: GameFolder } | { ok: false; problem: UpdateFolderProblem }

/** A game saved from a folder. Its data comes from the files and is never translated. */
export interface FolderGame {
  id: string
  /** Title shown in the app, e.g. "Crash Bandicoot (USA)". */
  title: string
  /** Absolute path of the file the emulator opens. */
  filePath: string
}

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
   * or says why it can't. Subfolders that are other platforms' folders are left out. One scan
   * runs at a time: starting one cancels the one running.
   */
  scanFolder(request: ScanFolderRequest): Promise<ScanFolderResult>
  /** Cancels the running scan, which then resolves as `cancelled`; nothing when none runs. */
  cancelScan(): Promise<void>
  /** Calls `listener` as the running scan advances. Returns the unsubscribe function. */
  onScanProgress(listener: (progress: ScanProgress) => void): () => void
  /**
   * Adds the folder of the latest scan with its playable games (damaged ones are left out),
   * or says why it can't. A game removed before with the same platform and file comes back
   * as it was.
   */
  addFolder(scanId: string): Promise<AddFolderResult>
  /** The folders the user added, oldest first. */
  listFolders(): Promise<GameFolder[]>
  /** The games saved from a folder, by title; none when it isn't one of the user's folders. */
  listFolderGames(folderId: string): Promise<FolderGame[]>
  /**
   * Finds the games in a folder the user added, at its path and for its platform, as
   * `scanFolder` does (with its progress and one scan at a time), or says why it can't.
   */
  rescanFolder(folderId: string): Promise<ScanFolderResult>
  /**
   * Updates the folder of the latest scan made with `rescanFolder` to its playable games:
   * new ones are added, those no longer found are removed (keeping their history) and the
   * rest stay as they were. Says why when it can't.
   */
  updateFolder(scanId: string): Promise<UpdateFolderResult>
}

export const LIBRARY_CHANNELS = {
  pickFolder: 'library:pick-folder',
  scanFolder: 'library:scan-folder',
  cancelScan: 'library:cancel-scan',
  scanProgress: 'library:scan-progress',
  addFolder: 'library:add-folder',
  listFolders: 'library:list-folders',
  listFolderGames: 'library:list-folder-games',
  rescanFolder: 'library:rescan-folder',
  updateFolder: 'library:update-folder'
} as const
