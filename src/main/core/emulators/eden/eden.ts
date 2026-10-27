import { getCatalogPlatform } from '@shared/platformCatalog'

import type { EmulatorModule, LaunchPlan } from '../emulatorModules.types'
import { edenLaunchArgs, parseEdenVersion } from './eden.parsers'

/** Eden plays the Nintendo Switch, which RetroArch doesn't. */
const PLATFORM_ID = 'switch'

/**
 * The extensions of the files Eden opens, as its desktop entry's `MimeType` declares them:
 * games (`nsp`, `xci`) and homebrew programs (`nro`, `nso`), which the platform catalog
 * leaves out of the library.
 */
const EXTENSIONS = ['nsp', 'xci', 'nro', 'nso']

/**
 * What every start of Eden needs: its AppImage's update check off, so it never asks on start
 * a question the user can't answer with a gamepad.
 */
const ENV: LaunchPlan['env'] = { DISABLE_AUTO_UPDATES: '1' }

/**
 * Eden, a Nintendo Switch emulator derived from yuzu. It declares nothing about what it plays
 * in a machine-readable way, so its platform and extensions are written here. To play, it
 * needs the user's keys (`prod.keys`) and firmware, set up in its own menus.
 */
export const edenModule: EmulatorModule = {
  kind: 'eden',
  desktopIds: ['dev.eden_emu.eden'],

  // Its AppImage declares its version (`X-AppImage-Version`), so Eden is never run for it.
  readVersion: async (_installation, declaredVersion) => parseEdenVersion(declaredVersion),

  listOptions: async () => {
    const { name, manufacturer } = getCatalogPlatform(PLATFORM_ID)
    return [
      {
        id: null,
        name: null,
        platform: { id: PLATFORM_ID, name, manufacturer },
        extensions: EXTENSIONS
      }
    ]
  },

  // Eden has no options: one with an id isn't Eden's.
  prepareLaunch: async (_installation, { optionId, gamePath }) =>
    optionId === null ? { args: edenLaunchArgs(gamePath), env: ENV } : null,

  prepareOpen: async () => ({ args: [], env: ENV })
}
