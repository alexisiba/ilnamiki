export interface LastPlayedGame {
  title: string
  platform: string
  description: string
  imageUrl: string
  lastPlayedAt: Date
  playtimeMinutes: number
}

export interface ContinueHeroProps {
  game: LastPlayedGame
}
