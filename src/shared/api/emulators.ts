/** Setting up the emulators Ilnamiki launches games with. */
export interface EmulatorsApi {
  /**
   * Asks the user to choose an emulator's application file with the system's file picker.
   * Resolves with the file's absolute path, or null when the user cancels.
   */
  pickExecutable(): Promise<string | null>
}

export const EMULATORS_CHANNELS = {
  pickExecutable: 'emulators:pick-executable'
} as const
