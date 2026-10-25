import type { EmulatorKind } from '@shared/api'

/** An emulator Ilnamiki recognizes, and how to read what it reports about itself. */
export interface KnownEmulator {
  kind: Exclude<EmulatorKind, 'unknown'>
  /** Ids of its desktop entry (the file name without `.desktop`), e.g. "com.libretro.RetroArch". */
  desktopIds: string[]
  /** Arguments that make it print its version and exit. */
  versionArgs: string[]
  /** Its version from what `versionArgs` printed, or null when it isn't there. */
  parseVersion: (output: string) => string | null
}

/** Reads "Version: 1.22.2 (Git b40db22) Sep 25 2026" as "1.22.2". */
export function parseRetroArchVersion(output: string): string | null {
  return /^Version:\s*(\S+)/m.exec(output)?.[1] ?? null
}

/** The emulators Ilnamiki recognizes. */
export const KNOWN_EMULATORS: KnownEmulator[] = [
  {
    kind: 'retroarch',
    desktopIds: ['com.libretro.RetroArch', 'retroarch'],
    versionArgs: ['--version'],
    parseVersion: parseRetroArchVersion
  }
]

/** The known emulator whose desktop entry is `desktopId`, if any. */
export function findKnownEmulator(desktopId: string): KnownEmulator | undefined {
  return KNOWN_EMULATORS.find((emulator) => emulator.desktopIds.includes(desktopId))
}
