import { useEffect, useState } from 'react'

import { pauseBackgroundMusic, resumeBackgroundMusic } from '@renderer/core/audio'
import { launchGame, subscribeToGameEnded } from '@renderer/core/ipc'

import type { PlayProblem } from './GamePanel.utils'

export interface PlayGameState {
  /** Whether the game is starting or being played, until its emulator closes. */
  playing: boolean
  /** Why the last attempt to play didn't start the game, if it didn't. */
  problem: PlayProblem | undefined
  /** Starts the game; nothing while it is already starting or being played. */
  play: () => Promise<void>
}

/** Plays the game `gameId` with its emulator, following it until the emulator closes. */
export function usePlayGame(gameId: string): PlayGameState {
  const [playing, setPlaying] = useState(false)
  const [problem, setProblem] = useState<PlayProblem>()

  useEffect(
    () =>
      subscribeToGameEnded((ended) => {
        if (ended.gameId !== gameId) return
        setPlaying(false)
        resumeBackgroundMusic()
      }),
    [gameId]
  )

  const play = async (): Promise<void> => {
    if (playing) return
    setPlaying(true)
    setProblem(undefined)
    try {
      const result = await launchGame(gameId)
      if (result.ok) {
        // The emulator has its own sound.
        pauseBackgroundMusic()
        return
      }
      setProblem(result.problem)
    } catch {
      setProblem('failed')
    }
    setPlaying(false)
  }

  return { playing, problem, play }
}
