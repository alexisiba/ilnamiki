/** The user's game library: the folders games are found in. */
export interface LibraryApi {
  /**
   * Asks the user to choose a folder of games with the system's folder picker, which only
   * lets folders be chosen. Resolves with its absolute path, or null when the user cancels.
   */
  pickFolder(): Promise<string | null>
}

export const LIBRARY_CHANNELS = {
  pickFolder: 'library:pick-folder'
} as const
