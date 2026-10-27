import type { EmulatorKind } from '@shared/api'

import type { EmulatorInstallation } from './installation'

/** An emulator Ilnamiki has a module for. */
export type KnownEmulatorKind = Exclude<EmulatorKind, 'unknown'>

/** The platform an emulator option plays. */
export interface OptionPlatform {
  /** Id from the platform catalog when it lists the platform, e.g. "nintendo_64". */
  id: string
  /** e.g. "Nintendo 64". */
  name: string
  /** e.g. "Nintendo"; null when not known. */
  manufacturer: string | null
}

/** One way an emulator plays one platform. */
export interface EmulatorOption {
  /** What its module needs to play this way (e.g. a RetroArch core); null when it has no options. */
  id: string | null
  /** Shown after the emulator's name (e.g. "Mupen64Plus-Next"); null when it has no options. */
  name: string | null
  platform: OptionPlatform
  /** Extensions of the games it plays, lowercase and without the dot; empty when unknown. */
  extensions: string[]
}

/** What to start a game with. */
export interface LaunchRequest {
  /** The option to play with, one of `listOptions`'s ids. */
  optionId: string | null
  /** Absolute path of the game's file. */
  gamePath: string
}

/** How to start an emulator: its own arguments and the environment it needs. */
export interface LaunchPlan {
  args: string[]
  /** Variables added to Ilnamiki's own environment, e.g. to turn off an update check. */
  env: Record<string, string>
}

/** What Ilnamiki knows about one emulator. Every module implements it. */
export interface EmulatorModule {
  kind: KnownEmulatorKind
  /** Ids of the desktop entries that recognize its application, e.g. "com.libretro.RetroArch". */
  desktopIds: string[]
  /**
   * Its version: `declaredVersion` (what its package declares, e.g. `X-AppImage-Version`) or
   * what the emulator prints. Null when it can't be read.
   */
  readVersion(
    installation: EmulatorInstallation,
    declaredVersion: string | null
  ): Promise<string | null>
  /** The ways it plays each platform now, read live; empty when it plays none. */
  listOptions(installation: EmulatorInstallation): Promise<EmulatorOption[]>
  /** How to start a game in full screen with one of its options; null when it can't anymore. */
  prepareLaunch(
    installation: EmulatorInstallation,
    request: LaunchRequest
  ): Promise<LaunchPlan | null>
  /** How to open it alone, in full screen, to be set up in its own menus. */
  prepareOpen(installation: EmulatorInstallation): Promise<LaunchPlan>
}
