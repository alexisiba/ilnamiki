import { dialog, type BrowserWindow, type OpenDialogOptions } from 'electron'

/** What the picker lets the user choose. */
export type PathKind = 'file' | 'directory'

const PROPERTIES: Record<PathKind, OpenDialogOptions['properties']> = {
  file: ['openFile'],
  directory: ['openDirectory']
}

/**
 * Opens the system's picker, over `window` when there is one, to choose a single file or
 * folder: its absolute path, or null when the user cancels. Electron provides the picker on
 * every platform, so there are no platform providers.
 */
export async function pickPath(
  window: BrowserWindow | null,
  kind: PathKind
): Promise<string | null> {
  const options: OpenDialogOptions = { properties: PROPERTIES[kind] }
  const { canceled, filePaths } = window
    ? await dialog.showOpenDialog(window, options)
    : await dialog.showOpenDialog(options)

  return canceled ? null : (filePaths[0] ?? null)
}
