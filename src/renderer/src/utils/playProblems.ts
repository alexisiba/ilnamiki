import type { LaunchGameProblem, LaunchRandomGameProblem } from '@shared/api'

/** Why a game couldn't be started: what main reports, or a failure to reach main. */
export type PlayProblem = LaunchGameProblem | LaunchRandomGameProblem | 'failed'

const MESSAGE_KEYS: Record<PlayProblem, string> = {
  'unknown-game': 'play.problems.unknownGame',
  'missing-file': 'play.problems.missingFile',
  'no-core': 'play.problems.noCore',
  'no-games': 'play.problems.noGames',
  'already-playing': 'play.problems.alreadyPlaying',
  'not-started': 'play.problems.notStarted',
  failed: 'play.problems.failed'
}

/** The key, in the `common` namespace, of the message that explains why a game didn't start. */
export function playProblemMessageKey(problem: PlayProblem): string {
  return MESSAGE_KEYS[problem]
}
