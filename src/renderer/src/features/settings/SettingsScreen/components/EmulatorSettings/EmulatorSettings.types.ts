import type { Emulator } from '@renderer/types/emulator'

export interface EmulatorSettingsProps {
  /** Opens the form that adds an emulator. */
  onAdd: () => void
  /** Opens an emulator's details. */
  onOpen: (emulatorId: string) => void
}

export interface EmulatorListItemProps {
  emulator: Emulator
  onOpen: () => void
}
