import { useEffect, useRef, useState } from 'react'

import { pauseBackgroundMusic, resumeBackgroundMusic } from '@renderer/core/audio'
import { subscribeToGameEnded } from '@renderer/core/ipc'
import type { PlayProblem } from '@renderer/utils/playProblems'

export interface PlayGameState {
  /** Whether the game is starting or being played, until its emulator closes. */
  playing: boolean
  /** Why the last attempt to play didn't start the game, if it didn't. */
  problem: PlayProblem | undefined
  /** Starts the game; nothing while it is already starting or being played. */
  play: () => Promise<void>
}

/** Which game started, or why none did. */
export type PlayLaunchResult = { ok: true; gameId: string } | { ok: false; problem: PlayProblem }

/**
 * Plays the game `launch` starts with its emulator, following the game it says started until
 * its emulator closes. `launch` is called when the user plays, so it may change between renders.
 */
export function usePlay(launch: () => Promise<PlayLaunchResult>): PlayGameState {
  const [playing, setPlaying] = useState(false)
  const [problem, setProblem] = useState<PlayProblem>()
  // The game being played, known once its emulator started.
  const playedGameId = useRef<string | null>(null)

  useEffect(
    () =>
      subscribeToGameEnded((ended) => {
        if (ended.gameId !== playedGameId.current) return
        playedGameId.current = null
        setPlaying(false)
        resumeBackgroundMusic()
      }),
    []
  )

  const play = async (): Promise<void> => {
    if (playing) return
    setPlaying(true)
    setProblem(undefined)
    try {
      const result = await launch()
      if (result.ok) {
        playedGameId.current = result.gameId
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
