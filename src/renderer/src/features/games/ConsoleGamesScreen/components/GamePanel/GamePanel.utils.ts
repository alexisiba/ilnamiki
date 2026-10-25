import type { LaunchGameProblem } from '@shared/api'

/** Why a game couldn't be started: what main reports, or a failure to reach main. */
export type PlayProblem = LaunchGameProblem | 'failed'

const MESSAGE_KEYS: Record<PlayProblem, string> = {
  'unknown-game': 'consoleGames.playProblems.unknownGame',
  'missing-file': 'consoleGames.playProblems.missingFile',
  'no-core': 'consoleGames.playProblems.noCore',
  'already-playing': 'consoleGames.playProblems.alreadyPlaying',
  'not-started': 'consoleGames.playProblems.notStarted',
  failed: 'consoleGames.playProblems.failed'
}

/** The key, in the `games` namespace, of the message that explains why a game didn't start. */
export function playProblemMessageKey(problem: PlayProblem): string {
  return MESSAGE_KEYS[problem]
}
