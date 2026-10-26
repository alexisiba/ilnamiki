import type { FolderGame } from '@shared/api'

import type { LibraryGame } from '@renderer/types/game'

/**
 * A game saved from a folder as the library shows it: titled as its file is, with no
 * metadata yet (a generic image shows instead of its artwork).
 */
export function toLibraryGame(game: FolderGame): LibraryGame {
  return {
    id: game.id,
    title: game.title,
    imageUrl: null,
    releaseYear: null,
    genre: null,
    players: null,
    description: null
  }
}
