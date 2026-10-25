import type { ScanFolderRequest, ScanFolderResult, ScanProgress } from '@shared/api'

/**
 * Asks the user to choose a folder of games with the system's folder picker: its absolute
 * path, or null when the user cancels.
 */
export function pickGameFolder(): Promise<string | null> {
  return window.api.library.pickFolder()
}

/**
 * Finds the games in a folder for a platform, or says why it can't. Starting a scan cancels
 * the one running; follow its progress with `subscribeToScanProgress`.
 */
export function scanGameFolder(request: ScanFolderRequest): Promise<ScanFolderResult> {
  return window.api.library.scanFolder(request)
}

/** Cancels the running scan, which then resolves as `cancelled`. */
export function cancelGameFolderScan(): Promise<void> {
  return window.api.library.cancelScan()
}

/** Calls `listener` as the running scan advances. Returns the unsubscribe function. */
export function subscribeToScanProgress(listener: (progress: ScanProgress) => void): () => void {
  return window.api.library.onScanProgress(listener)
}
