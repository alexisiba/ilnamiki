import type { ShelfGame } from './components/GameShelf'

export interface RecentGame extends Omit<ShelfGame, 'caption'> {
  lastPlayedAt: Date
}
