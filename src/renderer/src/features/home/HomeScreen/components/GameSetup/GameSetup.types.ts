import type { Emulator, InstalledPlatform } from '@shared/api'

export interface GameSetupProps {
  /** The user's emulators, listed with how many platforms each plays. */
  emulators: Emulator[]
  platforms: InstalledPlatform[]
}
