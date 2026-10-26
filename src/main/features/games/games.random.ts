/**
 * The games among `games` that can be played: those of a platform in `playablePlatformIds`,
 * the platforms an installed core plays.
 */
export function onPlayablePlatforms<Game extends { platformId: string }>(
  games: Game[],
  playablePlatformIds: ReadonlySet<string>
): Game[] {
  return games.filter((game) => playablePlatformIds.has(game.platformId))
}

/**
 * `items` in a random order, each order as likely as the others (Fisher–Yates), without
 * changing `items`. `random` returns a number in [0, 1), as `Math.random` does.
 */
export function inRandomOrder<Item>(items: Item[], random: () => number = Math.random): Item[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]]
  }
  return shuffled
}
