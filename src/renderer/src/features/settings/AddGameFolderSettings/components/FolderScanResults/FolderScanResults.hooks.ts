import { useEffect, useEffectEvent, useState } from 'react'

import type { FolderScan, ScanFolderRequest } from '@shared/api'

import {
  addGameFolder,
  cancelGameFolderScan,
  scanGameFolder,
  subscribeToScanProgress
} from '@renderer/core/ipc'

import type { FolderSaveProblem, FolderScanProblem } from '../../AddGameFolderSettings.utils'

export interface FolderScanState {
  /** What the scan found, or null while it runs. */
  scan: FolderScan | null
  /** 0–100 while the scan runs. */
  percent: number
  /** How many of the games found can be played (and saved). */
  playableCount: number
  /** Whether the folder can be saved: the scan found a playable game and nothing is saving. */
  canSave: boolean
  /** Why the last attempt to save failed, if it did. */
  saveProblem: FolderSaveProblem | undefined
  save: () => Promise<void>
}

/**
 * Scans `request`'s folder as soon as it mounts, following its progress, and cancels the scan
 * if it unmounts first (e.g. on back). A scan that fails calls `onFailed`; saving calls
 * `onSaved` once the folder is added.
 */
export function useFolderScan(
  request: ScanFolderRequest,
  onFailed: (problem: FolderScanProblem) => void,
  onSaved: () => void
): FolderScanState {
  const [scan, setScan] = useState<FolderScan | null>(null)
  const [percent, setPercent] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveProblem, setSaveProblem] = useState<FolderSaveProblem>()
  const fail = useEffectEvent(onFailed)

  useEffect(() => {
    let running = true
    const unsubscribe = subscribeToScanProgress((progress) => {
      if (running) setPercent(progress.percent)
    })

    scanGameFolder(request)
      .then((result) => {
        if (!running) return
        running = false
        if (result.ok) setScan(result.scan)
        // A cancelled scan was replaced or left on purpose: nothing to explain.
        else if (result.problem !== 'cancelled') fail(result.problem)
      })
      .catch(() => {
        if (!running) return
        running = false
        fail('failed')
      })

    return () => {
      unsubscribe()
      if (running) void cancelGameFolderScan()
      running = false
    }
  }, [request])

  const playableCount = scan ? scan.games.filter((game) => game.problem === null).length : 0

  const save = async (): Promise<void> => {
    if (!scan) return
    setSaving(true)
    setSaveProblem(undefined)
    try {
      const result = await addGameFolder(scan.id)
      if (result.ok) {
        onSaved()
        return
      }
      setSaveProblem(result.problem)
    } catch {
      setSaveProblem('failed')
    }
    setSaving(false)
  }

  return {
    scan,
    percent,
    playableCount,
    canSave: playableCount > 0 && !saving,
    saveProblem,
    save
  }
}
