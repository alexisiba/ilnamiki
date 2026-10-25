import { useEffect, useState } from 'react'

import type { FolderGame } from '@shared/api'

import { listFolderGames } from './library'

export interface FolderGamesState {
  /** `loading` until main answers, `failed` when it can't. */
  status: 'loading' | 'ready' | 'failed'
  /** By title; empty until they are read. */
  games: FolderGame[]
}

const LOADING: FolderGamesState = { status: 'loading', games: [] }

/** The games saved from the folder `folderId`, read from main on mount and when it changes. */
export function useFolderGames(folderId: string): FolderGamesState {
  // Kept with the folder they belong to, so another folder's games never show.
  const [read, setRead] = useState<{ folderId: string; state: FolderGamesState }>()

  useEffect(() => {
    let active = true
    listFolderGames(folderId).then(
      (games) => {
        if (active) setRead({ folderId, state: { status: 'ready', games } })
      },
      () => {
        if (active) setRead({ folderId, state: { status: 'failed', games: [] } })
      }
    )
    return () => {
      active = false
    }
  }, [folderId])

  return read?.folderId === folderId ? read.state : LOADING
}
