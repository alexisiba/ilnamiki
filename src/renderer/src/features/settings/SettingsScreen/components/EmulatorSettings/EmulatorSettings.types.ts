import type { Emulator } from '@renderer/types/emulator'

export interface EmulatorSettingsProps {
  /** Leaves the emulator settings, back to the list of categories. */
  onBack: () => void
}

export interface EmulatorListItemProps {
  emulator: Emulator
}
