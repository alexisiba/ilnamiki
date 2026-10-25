import type { Emulator } from '@renderer/types/emulator'

export interface EmulatorSettingsProps {
  emulators: Emulator[]
  /** Opens the form that adds an emulator. */
  onAdd: () => void
}

export interface EmulatorListItemProps {
  emulator: Emulator
}
