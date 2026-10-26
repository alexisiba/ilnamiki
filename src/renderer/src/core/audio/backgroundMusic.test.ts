import { describe, expect, it } from 'vitest'

import { isMusicPlaying } from '@renderer/test/audio'

import {
  pauseBackgroundMusic,
  resumeBackgroundMusic,
  startBackgroundMusic
} from './backgroundMusic'

describe('background music', () => {
  it('plays from when it starts until it stops', () => {
    const stop = startBackgroundMusic()
    expect(isMusicPlaying()).toBe(true)

    stop()

    expect(isMusicPlaying()).toBe(false)
  })

  it('pauses while a game is played and resumes when it ends', () => {
    startBackgroundMusic()

    pauseBackgroundMusic()
    expect(isMusicPlaying()).toBe(false)

    resumeBackgroundMusic()
    expect(isMusicPlaying()).toBe(true)
  })

  it('does not resume once stopped', () => {
    const stop = startBackgroundMusic()
    pauseBackgroundMusic()
    stop()

    resumeBackgroundMusic()

    expect(isMusicPlaying()).toBe(false)
  })

  it('stays paused when it starts during a game', () => {
    pauseBackgroundMusic()

    startBackgroundMusic()

    expect(isMusicPlaying()).toBe(false)
  })
})
