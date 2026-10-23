export interface RecentGame {
  id: string
  title: string
  platform: string
  imageUrl: string
  lastPlayedAt: Date
}

export interface RecentlyPlayedProps {
  games: RecentGame[]
}

export interface RecentGameCardProps {
  game: RecentGame
}
