import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { Button } from '@renderer/components/Button'
import {
  pickGameFolder,
  rescanGameFolder,
  updateGameFolder,
  useGameFolders,
  usePlatforms
} from '@renderer/core/ipc'
import { FocusGroup, useBackStep, useGoBack } from '@renderer/core/navigation'

import { FolderScanResults } from '../components/FolderScanResults'
import { SettingsEmptyState } from '../components/SettingsEmptyState'
import type { FolderScanProblem } from '../utils/gameFolderProblems'
import { FolderGames } from './components/FolderGames'
import { FolderPath } from './components/FolderPath'
import { RemoveFolder } from './components/RemoveFolder'
import styles from './GameFolderDetailsSettings.module.css'

/**
 * A game folder's details, a screen inside Settings opened from the game folders list: its
 * platform and how many games it has, Scan again and Remove folder below them (above the
 * games, so a long list never keeps them out of reach), its path with Change path, the games
 * saved from it, and Back at the bottom; focus moves row by row. Scan again scans the folder, and Change path the folder chosen in the picker, in
 * a step of its own where the changes are saved (moving the folder there, for Change path).
 * Back in that step returns here; a folder that can't be scanned returns here too, saying
 * why. Says so when the folder is no longer there.
 */
export function GameFolderDetailsSettings(): React.JSX.Element | null {
  const { t } = useTranslation('settings')
  const { folderId } = useParams()
  const { status, folders } = useGameFolders()
  const { platforms } = usePlatforms()
  const folder = folders.find((candidate) => candidate.id === folderId)
  // As the back action does.
  const returnToList = useGoBack()
  /** The scan step, while open: of the folder's path, or of the `path` chosen to move it to. */
  const [scanStep, setScanStep] = useState<{ path?: string }>()
  const [problem, setProblem] = useState<FolderScanProblem>()

  const returnToDetails = (): void => setScanStep(undefined)
  useBackStep(scanStep ? returnToDetails : undefined)

  const back = (
    <Button focusId="back" onPress={returnToList}>
      {t('gameFolderDetails.back')}
    </Button>
  )

  if (!folder && status === 'loading') return null

  if (!folder) {
    return (
      <FocusGroup id="game-folder-details" className={styles.missing}>
        <SettingsEmptyState
          icon={TriangleAlert}
          title={t('gameFolderDetails.notFound')}
          action={back}
        />
      </FocusGroup>
    )
  }

  // A platform no emulator plays anymore keeps its folder, named by its id.
  const platformName =
    platforms.find(({ id }) => id === folder.platformId)?.name ?? folder.platformId

  if (scanStep) {
    return (
      <FolderScanResults
        path={scanStep.path ?? folder.path}
        platformName={platformName}
        scan={() => rescanGameFolder(folder.id, scanStep.path)}
        save={updateGameFolder}
        saveLabel={t('folderScan.saveChanges')}
        onBack={returnToDetails}
        onFailed={(scanProblem) => {
          setProblem(scanProblem)
          setScanStep(undefined)
        }}
        onSaved={returnToDetails}
      />
    )
  }

  // The folder chosen is scanned in the scan step, and the folder moves there once saved.
  const changePath = async (): Promise<void> => {
    setProblem(undefined)
    try {
      const path = await pickGameFolder()
      if (path === null || path === folder.path) return
      setScanStep({ path })
    } catch {
      setProblem('failed')
    }
  }

  return (
    <FocusGroup id="game-folder-details" movement="rows" className={styles.content}>
      <div className={styles.header}>
        <h2 className={styles.title}>{platformName}</h2>
        <p className={styles.count}>{t('gameFolders.games', { count: folder.gameCount })}</p>
      </div>
      <div className={styles.folderActions}>
        <Button
          focusId="rescan"
          autoFocus
          onPress={() => {
            setProblem(undefined)
            setScanStep({})
          }}
        >
          {t('gameFolderDetails.rescan')}
        </Button>
        <RemoveFolder folder={folder} platformName={platformName} onRemoved={returnToList} />
      </div>
      <FolderPath folder={folder} problem={problem} onChangePath={changePath} />
      <FolderGames folderId={folder.id} />
      <div className={styles.actions}>{back}</div>
    </FocusGroup>
  )
}
