/**
 * Asks the user to choose an emulator's application file with the system's file picker:
 * its absolute path, or null when the user cancels.
 */
export function pickEmulatorExecutable(): Promise<string | null> {
  return window.api.emulators.pickExecutable()
}
