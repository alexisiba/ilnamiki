import type { Emulator } from '@renderer/types/emulator'

/** Sample emulators until they can be set up. None has an icon yet. */
export const SAMPLE_EMULATORS: Emulator[] = [
  { id: 'retroarch', name: 'RetroArch', version: '1.21.0' },
  { id: 'pcsx2', name: 'PCSX2', version: '2.2.0' },
  { id: 'dolphin', name: 'Dolphin', version: '2412' },
  { id: 'ppsspp', name: 'PPSSPP', version: '1.18.1' }
]
