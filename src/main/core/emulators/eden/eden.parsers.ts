/** Reads the version Eden's AppImage declares, e.g. "v0.2.1", as "0.2.1"; null without one. */
export function parseEdenVersion(declaredVersion: string | null): string | null {
  const version = declaredVersion?.trim().replace(/^v(?=\d)/, '')
  return version ? version : null
}

/**
 * The arguments that start Eden in full screen straight into the game at `gamePath`, as its
 * own interface (`eden`, not `eden-cli`) reads them: `-f` for full screen, `-g` for the game.
 */
export function edenLaunchArgs(gamePath: string): string[] {
  return ['-f', '-g', gamePath]
}
