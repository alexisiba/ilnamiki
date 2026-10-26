import { useEffect, useEffectEvent, useState } from 'react'

import type { FolderScan, ScanFolderResult } from '@shared/api'

import { cancelGameFolderScan, subscribeToScanProgress } from '@renderer/core/ipc'

import type { FolderSaveProblem, FolderScanProblem } from '../../utils/gameFolderProblems'
import type { FolderScanSaveResult } from './FolderScanResults.types'

export interface FolderScanState {
  /** What the scan found, or null while it runs. */
  scan: FolderScan | null
  /** 0–100 while the scan runs. */
  percent: number
  /** How many of the games found can be played (and saved). */
  playableCount: number
  /** Whether the scan can be saved: it found a playable game and nothing is saving. */
  canSave: boolean
  /** Why the last attempt to save failed, if it did. */
  saveProblem: FolderSaveProblem | undefined
  save: () => Promise<void>
}

/**
 * Starts the scan with `startScan` as soon as it mounts, following its progress, and cancels
 * the scan if it unmounts first (e.g. on back). A scan that fails calls `onFailed`; saving
 * with `saveScan` calls `onSaved` once it is saved.
 */
export function useFolderScan(
  startScan: () => Promise<ScanFolderResult>,
  saveScan: (scanId: string) => Promise<FolderScanSaveResult>,
  onFailed: (problem: FolderScanProblem) => void,
  onSaved: () => void
): FolderScanState {
  const [scan, setScan] = useState<FolderScan | null>(null)
  const [percent, setPercent] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveProblem, setSaveProblem] = useState<FolderSaveProblem>()
  const start = useEffectEvent(startScan)
  const fail = useEffectEvent(onFailed)

  useEffect(() => {
    let running = true
    const unsubscribe = subscribeToScanProgress((progress) => {
      if (running) setPercent(progress.percent)
    })

    start()
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
  }, [])

  const playableCount = scan ? scan.games.filter((game) => game.problem === null).length : 0

  const save = async (): Promise<void> => {
    if (!scan) return
    setSaving(true)
    setSaveProblem(undefined)
    try {
      const result = await saveScan(scan.id)
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
