import { describe, expect, it } from 'vitest'

import type { EmulatorInstallation } from '../installation'
import { edenModule } from './eden'

/** An installation that is never read: Eden's module needs nothing from it yet. */
const INSTALLATION: EmulatorInstallation = {
  command: (args) => ({ file: '/home/player/Emulators/eden.AppImage', args }),
  folders: async () => null
}

describe('edenModule', () => {
  it('plays the Nintendo Switch one way, with the extensions its desktop entry declares', async () => {
    expect(await edenModule.listOptions(INSTALLATION)).toEqual([
      {
        id: null,
        name: null,
        platform: { id: 'switch', name: 'Nintendo Switch', manufacturer: 'Nintendo' },
        extensions: ['nsp', 'xci', 'nro', 'nso']
      }
    ])
  })

  it('starts a game in full screen with its AppImage’s update check off', async () => {
    expect(
      await edenModule.prepareLaunch(INSTALLATION, {
        optionId: null,
        gamePath: '/home/player/Games/Switch/Celeste.nsp'
      })
    ).toEqual({
      args: ['-f', '-g', '/home/player/Games/Switch/Celeste.nsp'],
      env: { DISABLE_AUTO_UPDATES: '1' }
    })
  })

  it('starts nothing with an option it doesn’t have', async () => {
    expect(
      await edenModule.prepareLaunch(INSTALLATION, {
        optionId: 'snes9x',
        gamePath: '/home/player/Games/Switch/Celeste.nsp'
      })
    ).toBeNull()
  })

  it('opens alone with its update check off too', async () => {
    expect(await edenModule.prepareOpen(INSTALLATION)).toEqual({
      args: [],
      env: { DISABLE_AUTO_UPDATES: '1' }
    })
  })

  it('reads its version from what its AppImage declares, never running it', async () => {
    expect(await edenModule.readVersion(INSTALLATION, 'v0.2.1')).toBe('0.2.1')
  })
})
