import type { Emulator } from '@renderer/types/emulator'

export interface EmulatorPathProps {
  emulator: Emulator
}

export interface OpenEmulatorProps {
  emulator: Emulator
}

export interface RemoveEmulatorProps {
  emulator: Emulator
  /** Called once the emulator is removed. */
  onRemoved: () => void
}
