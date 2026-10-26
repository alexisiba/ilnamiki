import type { EmulatorKind, EmulatorProblem } from '@shared/api'

/** An icon read from an emulator's application. */
export interface EmulatorIcon {
  data: Buffer
  /** e.g. "image/svg+xml". */
  mimeType: string
}

/** What a platform provider detects about an emulator's application. */
export interface DetectedEmulator {
  kind: EmulatorKind
  name: string | null
  version: string | null
  icon: EmulatorIcon | null
  /** When the application file was last modified, in milliseconds since the epoch. */
  fileModifiedAt: number
}

export type DetectEmulatorResult =
  { ok: true; detected: DetectedEmulator } | { ok: false; problem: EmulatorProblem }

/** How a platform tells what an emulator's application is. */
export interface EmulatorDetector {
  detect(executablePath: string): Promise<DetectEmulatorResult>
}
