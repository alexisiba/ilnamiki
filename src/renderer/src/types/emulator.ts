/** An emulator set up in Ilnamiki. Its data comes from the emulator and is never translated. */
export interface Emulator {
  id: string
  /** e.g. "RetroArch". */
  name: string
  /** As the emulator reports it, e.g. "1.21.0". */
  version: string
  /** The emulator's own icon, when there is one. */
  iconUrl?: string
}
