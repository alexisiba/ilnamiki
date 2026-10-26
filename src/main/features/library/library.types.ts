/** Why a folder's files couldn't be read. */
export type ReadFolderProblem = 'not-found' | 'not-a-folder' | 'not-readable'

export type ReadFolderResult =
  | {
      ok: true
      /**
       * Every file at the folder's top and at the top of its subfolders (hidden ones too),
       * relative to the folder with `/` separators.
       */
      files: string[]
      /** Text of the playlists, cue sheets and .gdi among `files`, by path. */
      indexTexts: Map<string, string>
    }
  | { ok: false; problem: ReadFolderProblem }

export interface ReadFolderOptions {
  /** Absolute paths of subfolders to leave out, e.g. other platforms' folders. */
  excludedFolders: string[]
  /** Stops the reading, which then throws. */
  signal: AbortSignal
  /** Called as the reading advances, with the fraction done (0–1). */
  onProgress: (fraction: number) => void
}

/** How an operating system reads the files of a folder of games. */
export interface FolderReader {
  read(path: string, options: ReadFolderOptions): Promise<ReadFolderResult>
}
