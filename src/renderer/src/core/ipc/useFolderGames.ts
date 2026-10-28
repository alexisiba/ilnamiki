import { useEffect, useState } from 'react'

import type { FolderGame } from '@shared/api'

import { subscribeToMetadataChanged } from './games'
import { listFolderGames } from './library'

export interface FolderGamesState {
  /** `loading` until main answers, `failed` when it can't. */
  status: 'loading' | 'ready' | 'failed'
  /** By title; empty until they are read. */
  games: FolderGame[]
}

const LOADING: FolderGamesState = { status: 'loading', games: [] }

/**
 * The games saved from the folder `folderId`, read from main on mount and when it changes,
 * and again when the metadata of any of them is found (their titles and artwork). Without a
 * folder (e.g. while the folders are read), nothing is read and it stays loading.
 */
export function useFolderGames(folderId: string | undefined): FolderGamesState {
  // Kept with the folder they belong to, so another folder's games never show.
  const [read, setRead] = useState<{ folderId: string; state: FolderGamesState }>()

  useEffect(() => {
    if (folderId === undefined) return
    let active = true
    let gameIds = new Set<string>()
    const load = (): void => {
      listFolderGames(folderId).then(
        (games) => {
          if (!active) return
          gameIds = new Set(games.map(({ id }) => id))
          setRead({ folderId, state: { status: 'ready', games } })
        },
        () => {
          if (active) setRead({ folderId, state: { status: 'failed', games: [] } })
        }
      )
    }

    load()
    const unsubscribe = subscribeToMetadataChanged((changed) => {
      if (changed.gameIds.some((id) => gameIds.has(id))) load()
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [folderId])

  return read !== undefined && read.folderId === folderId ? read.state : LOADING
}
