import { describe, expect, it } from 'vitest'

import { retroArchLaunchArgs, retroArchOverridesText } from './games.retroarch'

describe('retroArchOverridesText', () => {
  it('quits with Start + Select and on closing the game, without saving the configuration', () => {
    expect(retroArchOverridesText()).toBe(
      [
        'input_quit_gamepad_combo = "4"',
        'quit_on_close_content = "1"',
        'config_save_on_exit = "false"',
        ''
      ].join('\n')
    )
  })
})

describe('retroArchLaunchArgs', () => {
  it('starts in full screen with the core and the overrides, the game last and as it is', () => {
    expect(
      retroArchLaunchArgs({
        coreLibraryPath: '/home/player/.config/retroarch/cores/swanstation_libretro.so',
        overridesPath: '/home/player/.config/ilnamiki/retroarch/overrides.cfg',
        gamePath: '/home/player/Games/PS1/Crash Bandicoot (USA) [!].cue'
      })
    ).toEqual([
      '--fullscreen',
      '-L',
      '/home/player/.config/retroarch/cores/swanstation_libretro.so',
      '--appendconfig',
      '/home/player/.config/ilnamiki/retroarch/overrides.cfg',
      '/home/player/Games/PS1/Crash Bandicoot (USA) [!].cue'
    ])
  })
})
