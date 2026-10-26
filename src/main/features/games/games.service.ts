import { randomUUID } from 'crypto'
import { app } from 'electron'
import { mkdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'

import type {
  CoreRef,
  GameDetails,
  GamePlayer,
  LastPlayedGame,
  LaunchGameResult,
  LaunchRandomGameResult,
  RecentlyAddedGame,
  RecentlyPlayedGame
} from '@shared/api'

import { getDatabase } from '../../core/database'
import { freeEmulatorTurn, startEmulator, takeEmulatorTurn } from '../../core/emulatorProcess'
import {
  findCorePlayer,
  isAmongCores,
  listInstalledPlatforms,
  type PlatformPlayer
} from '../../core/installedPlatforms'
import { choosePlayingCore } from './games.player'
import { inRandomOrder, onPlayablePlatforms } from './games.random'
import { createGamesRepository, type PlayableGameRecord } from './games.repository'
import { retroArchLaunchArgs, retroArchOverridesText } from './games.retroarch'
import { isPlaySession } from './games.sessions'

/** Most games `listRecentlyAdded` returns, as the contract promises. */
const RECENTLY_ADDED_LIMIT = 20

/** Most games `listRecentlyPlayed` returns, as the contract promises. */
const RECENTLY_PLAYED_LIMIT = 20

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
 * Which installed cores play `game`'s platform, which one the user chose for it (while still
 * installed), and which one playing it uses, by `choosePlayingCore`'s order.
 */
async function resolveGamePlayer(game: PlayableGameRecord): Promise<GamePlayer> {
  const platform = (await listInstalledPlatforms()).find(({ id }) => id === game.platformId)
  const installed = platform?.cores ?? []
  const last = createGamesRepository(getDatabase()).findLastPlayer(game.id)
  const chosenCore =
    game.chosenCore && isAmongCores(game.chosenCore, installed) ? game.chosenCore : null

  return {
    cores: installed,
    chosenCore,
    playsWith: choosePlayingCore({
      game: chosenCore,
      lastSession: last?.core ? { emulatorId: last.emulatorId, coreId: last.core } : null,
      platformDefault: platform?.defaultCore ?? null,
      installed
    })
  }
}

/** How to start `game`: the application and core library of the core it plays with. */
async function findGamePlayer(game: PlayableGameRecord): Promise<PlatformPlayer | null> {
  const { playsWith } = await resolveGamePlayer(game)
  return playsWith && findCorePlayer(playsWith.core.emulatorId, playsWith.core.coreId)
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

/** Whether a game started, or why its emulator didn't. */
type StartGameResult = { ok: true } | { ok: false; problem: 'no-core' | 'not-started' }

/**
 * Starts `game`, whose file is there, in full screen with `findGamePlayer`'s emulator and
 * core, once the emulator's turn is taken. When the emulator closes, the time played is
 * recorded and `onEnded` is called.
 */
async function startGame(game: PlayableGameRecord, onEnded: () => void): Promise<StartGameResult> {
  const player = await findGamePlayer(game)
  if (!player) return { ok: false, problem: 'no-core' }

  const args = retroArchLaunchArgs({
    coreLibraryPath: player.coreLibraryPath,
    overridesPath: await writeRetroArchOverrides(),
    gamePath: game.filePath
  })
  const startedAt = Date.now()
  const started = await startEmulator(player.executablePath, args, () => {
    recordPlaySession(game.id, player, startedAt)
    onEnded()
  })
  return started ? { ok: true } : { ok: false, problem: 'not-started' }
}

/** Playing the library's games with the emulators the user added. */
export const gamesService = {
  /** The game of the library played most recently, or null when none was played. */
  getLastPlayed(): LastPlayedGame | null {
    return createGamesRepository(getDatabase()).findLastPlayed()
  },

  /** The 20 games played most recently at most after the last played one, newest first. */
  listRecentlyPlayed(): RecentlyPlayedGame[] {
    return createGamesRepository(getDatabase()).listRecentlyPlayed(RECENTLY_PLAYED_LIMIT)
  },

  /** The 20 games most recently added to the library at most, newest first. */
  listRecentlyAdded(): RecentlyAddedGame[] {
    return createGamesRepository(getDatabase()).listRecentlyAdded(RECENTLY_ADDED_LIMIT)
  },

  /** What the library knows about the game `gameId`, or null when it isn't in the library. */
  getDetails(gameId: string): GameDetails | null {
    return createGamesRepository(getDatabase()).findDetails(gameId)
  },

  /** Which cores can play the game `gameId` and which one it plays with, or null. */
  async getPlayer(gameId: string): Promise<GamePlayer | null> {
    const game = createGamesRepository(getDatabase()).findPlayable(gameId)
    return game ? resolveGamePlayer(game) : null
  },

  /**
   * Keeps `core` as the one the game `gameId` plays with, or forgets the choice with null.
   * Throws when the game isn't in the library or `core` doesn't play its platform.
   */
  async setCore(gameId: string, core: CoreRef | null): Promise<void> {
    const repository = createGamesRepository(getDatabase())
    const game = repository.findPlayable(gameId)
    if (!game) throw new Error(`The game ${gameId} isn't in the library`)
    if (core) {
      const { cores } = await resolveGamePlayer(game)
      if (!isAmongCores(core, cores)) {
        throw new Error(`The core ${core.coreId} doesn't play ${game.platformId}`)
      }
    }
    repository.setChosenCore(gameId, core)
  },

  /**
   * Starts the game `gameId` in full screen with the core `getPlayer` says it plays with, or
   * says why it can't. When the emulator closes, the time played is recorded and `onEnded`
   * is called.
   */
  async launch(gameId: string, onEnded: () => void): Promise<LaunchGameResult> {
    if (!takeEmulatorTurn()) return { ok: false, problem: 'already-playing' }

    let started = false
    try {
      const game = createGamesRepository(getDatabase()).findPlayable(gameId)
      if (!game) return { ok: false, problem: 'unknown-game' }
      if (!(await isFile(game.filePath))) return { ok: false, problem: 'missing-file' }

      const result = await startGame(game, onEnded)
      started = result.ok
      return result
    } finally {
      // Until it ends, a game that started keeps the others waiting.
      if (!started) freeEmulatorTurn()
    }
  },

  /**
   * Starts a game picked at random among the library's games, of every folder, that an
   * installed core plays and whose platform is on, as `launch` starts it; a game whose file isn't there, or whose core
   * can't be found, is passed over for another. Says which game started, or why none did. When its emulator closes, the time
   * played is recorded and `onEnded` is called with the game's id.
   */
  async launchRandom(onEnded: (gameId: string) => void): Promise<LaunchRandomGameResult> {
    if (!takeEmulatorTurn()) return { ok: false, problem: 'already-playing' }

    let started = false
    try {
      const playablePlatformIds = new Set(
        (await listInstalledPlatforms())
          .filter((platform) => platform.isEnabled)
          .map((platform) => platform.id)
      )
      const games = onPlayablePlatforms(
        createGamesRepository(getDatabase()).listPlayable(),
        playablePlatformIds
      )

      for (const game of inRandomOrder(games)) {
        if (!(await isFile(game.filePath))) continue

        const result = await startGame(game, () => onEnded(game.id))
        if (result.ok) {
          started = true
          return { ok: true, gameId: game.id }
        }
        // An emulator that can't run would fail the other games too.
        if (result.problem === 'not-started') return { ok: false, problem: 'not-started' }
      }
      return { ok: false, problem: 'no-games' }
    } finally {
      // Until it ends, a game that started keeps the others waiting.
      if (!started) freeEmulatorTurn()
    }
  }
}
