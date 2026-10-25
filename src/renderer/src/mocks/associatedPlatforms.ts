import type { AssociatedPlatform } from '@renderer/types/associatedPlatform'

/** Extensions written as a core info file lists them, e.g. "n64|v64|z64". */
const extensionsOf = (supportedExtensions: string): string[] => supportedExtensions.split('|')

/**
 * Sample platforms with an installed core, until they are read from the emulators. Cores and
 * extensions are as RetroArch's core info files declare them.
 */
export const SAMPLE_ASSOCIATED_PLATFORMS: AssociatedPlatform[] = [
  {
    id: 'nes',
    name: 'Nintendo Entertainment System',
    core: 'Mesen',
    extensions: extensionsOf('nes|fds|unf|unif'),
    enabled: true
  },
  {
    id: 'super_nes',
    name: 'Super Nintendo',
    core: 'Snes9x',
    extensions: extensionsOf('smc|sfc|swc|fig|bs|st'),
    enabled: true
  },
  {
    id: 'nintendo_64',
    name: 'Nintendo 64',
    core: 'Mupen64Plus-Next',
    extensions: extensionsOf('n64|v64|z64|ndd|bin|u1'),
    enabled: true
  },
  {
    id: 'game_boy_advance',
    name: 'Game Boy Advance',
    core: 'mGBA',
    extensions: extensionsOf('gb|gbc|gba'),
    enabled: false
  },
  {
    id: 'mega_drive',
    name: 'Mega Drive',
    core: 'Genesis Plus GX',
    extensions: extensionsOf('mdx|md|smd|gen|bin|cue|iso|sms|bms|gg|sg|68k|sgd|chd|m3u'),
    enabled: true
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    core: 'SwanStation',
    extensions: extensionsOf('exe|psexe|cue|bin|img|iso|chd|pbp|ecm|mds|psf|m3u'),
    enabled: false
  }
]
