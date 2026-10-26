import { randomUUID } from 'crypto'
import { app } from 'electron'
import { mkdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'

import type { GameDetails, LastPlayedGame, LaunchGameResult, RecentlyAddedGame } from '@shared/api'

import { getDatabase } from '../../core/database'
import { freeEmulatorTurn, startEmulator, takeEmulatorTurn } from '../../core/emulatorProcess'
import {
  findCorePlayer,
  findPlatformPlayer,
  type PlatformPlayer
} from '../../core/installedPlatforms'
import { createGamesRepository, type PlayableGameRecord } from './games.repository'
import { retroArchLaunchArgs, retroArchOverridesText } from './games.retroarch'
import { isPlaySession } from './games.sessions'

/** Most games `listRecentlyAdded` returns, as the contract promises. */
const RECENTLY_ADDED_LIMIT = 20

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

/**
 * Writes Ilnamiki's RetroArch settings to the app's data folder, fresh on every launch so
 * they always match this version of the app. Returns the file's path.
 */
async function writeRetroArchOverrides(): Promise<string> {
  const folder = join(app.getPath('userData'), 'retroarch')
  await mkdir(folder, { recursive: true })
  const path = join(folder, 'overrides.cfg')
  await writeFile(path, retroArchOverridesText(), 'utf8')
  return path
}

/**
 * How to play `game`: with the emulator and core it was last played with, so it opens where
 * the user left it (RetroArch keeps saves per core), or with its platform's while it was
 * never played or those aren't installed anymore. Null when nothing installed plays it.
 */
async function findGamePlayer(game: PlayableGameRecord): Promise<PlatformPlayer | null> {
  const last = createGamesRepository(getDatabase()).findLastPlayer(game.id)
  if (last?.core) {
    const player = await findCorePlayer(last.emulatorId, last.core)
    if (player) return player
  }
  return findPlatformPlayer(game.platformId)
}

/**
 * Keeps that the game `gameId` was played with `player` from `startedAt` until now, however
 * its emulator closed, unless it closed too soon to count. A failure is logged, never thrown,
 * so the user still comes back from the game.
 */
function recordPlaySession(gameId: string, player: PlatformPlayer, startedAt: number): void {
  const endedAt = Date.now()
  if (!isPlaySession(startedAt, endedAt)) return
  try {
    createGamesRepository(getDatabase()).addPlaySession({
      id: randomUUID(),
      gameId,
      emulatorId: player.emulatorId,
      core: player.coreId,
      startedAt,
      endedAt,
      createdAt: Date.now()
    })
  } catch (error) {
    console.error('Could not record the play session:', error)
  }
}

/** Playing the library's games with the emulators the user added. */
export const gamesService = {
  /** The game of the library played most recently, or null when none was played. */
  getLastPlayed(): LastPlayedGame | null {
    return createGamesRepository(getDatabase()).findLastPlayed()
  },

  /** The 20 games most recently added to the library at most, newest first. */
  listRecentlyAdded(): RecentlyAddedGame[] {
    return createGamesRepository(getDatabase()).listRecentlyAdded(RECENTLY_ADDED_LIMIT)
  },

  /** What the library knows about the game `gameId`, or null when it isn't in the library. */
  getDetails(gameId: string): GameDetails | null {
    return createGamesRepository(getDatabase()).findDetails(gameId)
  },

  /**
   * Starts the game `gameId` in full screen with the emulator and core it was last played
   * with, or its platform's first installed core, or says why it can't. When the emulator
   * closes, the time played is recorded and `onEnded` is called.
   */
  async launch(gameId: string, onEnded: () => void): Promise<LaunchGameResult> {
    if (!takeEmulatorTurn()) return { ok: false, problem: 'already-playing' }

    let started = false
    try {
      const game = createGamesRepository(getDatabase()).findPlayable(gameId)
      if (!game) return { ok: false, problem: 'unknown-game' }
      if (!(await isFile(game.filePath))) return { ok: false, problem: 'missing-file' }

      const player = await findGamePlayer(game)
      if (!player) return { ok: false, problem: 'no-core' }

      const args = retroArchLaunchArgs({
        coreLibraryPath: player.coreLibraryPath,
        overridesPath: await writeRetroArchOverrides(),
        gamePath: game.filePath
      })
      const startedAt = Date.now()
      started = await startEmulator(player.executablePath, args, () => {
        recordPlaySession(game.id, player, startedAt)
        onEnded()
      })
      return started ? { ok: true } : { ok: false, problem: 'not-started' }
    } finally {
      // Until it ends, a game that started keeps the others waiting.
      if (!started) freeEmulatorTurn()
    }
  }
}
