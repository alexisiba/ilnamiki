import { dialog, type BrowserWindow, type OpenDialogOptions } from 'electron'

/**
 * Opens the system's file picker, over `window` when there is one, to choose a single file.
 * Electron provides the picker on every platform, so there are no platform providers.
 */
export async function pickExecutable(window: BrowserWindow | null): Promise<string | null> {
  const options: OpenDialogOptions = { properties: ['openFile'] }
  const { canceled, filePaths } = window
    ? await dialog.showOpenDialog(window, options)
    : await dialog.showOpenDialog(options)

  return canceled ? null : (filePaths[0] ?? null)
}
