import { pauseMusic, playMusic } from './audioOutput'

/** Whether the app has the music on. */
let started = false
/** Whether a game is being played, which keeps the music paused. */
let paused = false

function update(): void {
  if (started && !paused) playMusic()
  else pauseMusic()
}

/** Plays the music behind the menus, in a loop. Returns the function that stops it. */
export function startBackgroundMusic(): () => void {
  started = true
  update()
  return () => {
    started = false
    update()
  }
}

/** Pauses the music while a game is being played: the emulator has its own sound. */
export function pauseBackgroundMusic(): void {
  paused = true
  update()
}

/** Resumes the music where it was paused, once the game ends. */
export function resumeBackgroundMusic(): void {
  paused = false
  update()
}

/** Back to the music off and not paused, for tests. */
export function resetBackgroundMusic(): void {
  started = false
  paused = false
}
