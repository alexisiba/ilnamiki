import { describe, expect, it } from 'vitest'

import { getPlayedSounds } from '@renderer/test/audio'

import { playUiSound } from './uiSounds'

/** Lets the sounds asked for so far play, as they do once the input is handled. */
const inputHandled = (): Promise<void> => Promise.resolve()

describe('playUiSound', () => {
  it('plays the sound once the input is handled', async () => {
    playUiSound('select')
    expect(getPlayedSounds()).toEqual([])

    await inputHandled()

    expect(getPlayedSounds()).toEqual(['select'])
  })

  it('plays only the highest priority sound one input asks for', async () => {
    playUiSound('move')
    playUiSound('carousel-slide')
    playUiSound('select')
    await inputHandled()

    expect(getPlayedSounds()).toEqual(['carousel-slide'])
  })

  it('plays a sound for each input, even the same one again', async () => {
    playUiSound('move')
    await inputHandled()
    playUiSound('move')
    await inputHandled()

    expect(getPlayedSounds()).toEqual(['move', 'move'])
  })
})
