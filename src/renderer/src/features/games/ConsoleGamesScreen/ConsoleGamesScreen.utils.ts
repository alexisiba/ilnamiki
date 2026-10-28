import type { FolderGame } from '@shared/api'

import type { LibraryGame } from '@renderer/types/game'

/**
 * A game saved from a folder as the library shows it: with its title and its cover (a generic
 * image shows while it has none), without the rest of its metadata yet.
 */
export function toLibraryGame(game: FolderGame): LibraryGame {
  return {
    id: game.id,
    title: game.title,
    imageUrl: game.artwork.cover,
    releaseYear: null,
    genre: null,
    players: null,
    description: null
  }
}
