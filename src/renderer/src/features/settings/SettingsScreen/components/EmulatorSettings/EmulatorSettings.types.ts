import type { Emulator } from '@renderer/types/emulator'

export interface EmulatorSettingsProps {
  emulators: Emulator[]
  /** Leaves the emulator settings, back to the list of categories. */
  onBack: () => void
  /** Opens the form that adds an emulator. */
  onAdd: () => void
}

export interface EmulatorListItemProps {
  emulator: Emulator
}
