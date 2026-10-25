/**
 * Asks the user to choose a folder of games with the system's folder picker: its absolute
 * path, or null when the user cancels.
 */
export function pickGameFolder(): Promise<string | null> {
  return window.api.library.pickFolder()
}
