import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { Button } from '@renderer/components/Button'
import {
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
import styles from './GameFolderDetailsSettings.module.css'

/**
 * A game folder's details, a screen inside Settings opened from the game folders list: its
 * platform and how many games it has, its path, the games saved from it, and Scan again,
 * which scans it in a step of its own where the changes are saved. Back in that step returns
 * here; a folder that can't be scanned returns here too, saying why. Says so when the folder
 * is no longer there.
 */
export function GameFolderDetailsSettings(): React.JSX.Element | null {
  const { t } = useTranslation('settings')
  const { folderId } = useParams()
  const { status, folders } = useGameFolders()
  const { platforms } = usePlatforms()
  const folder = folders.find((candidate) => candidate.id === folderId)
  // As the back action does.
  const returnToList = useGoBack()
  const [rescanning, setRescanning] = useState(false)
  const [problem, setProblem] = useState<FolderScanProblem>()

  const returnToDetails = (): void => setRescanning(false)
  useBackStep(rescanning ? returnToDetails : undefined)

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

  // A platform whose core was uninstalled keeps its folder, named by its id.
  const platformName =
    platforms.find(({ id }) => id === folder.platformId)?.name ?? folder.platformId

  if (rescanning) {
    return (
      <FolderScanResults
        path={folder.path}
        platformName={platformName}
        scan={() => rescanGameFolder(folder.id)}
        save={updateGameFolder}
        saveLabel={t('folderScan.saveChanges')}
        onBack={returnToDetails}
        onFailed={(scanProblem) => {
          setProblem(scanProblem)
          setRescanning(false)
        }}
        onSaved={returnToDetails}
      />
    )
  }

  return (
    <FocusGroup id="game-folder-details" className={styles.content}>
      <div className={styles.header}>
        <h2 className={styles.title}>{platformName}</h2>
        <p className={styles.count}>{t('gameFolders.games', { count: folder.gameCount })}</p>
      </div>
      <FolderPath folder={folder} problem={problem} />
      <FolderGames folderId={folder.id} />
      <div className={styles.actions}>
        {back}
        <Button
          focusId="rescan"
          autoFocus
          onPress={() => {
            setProblem(undefined)
            setRescanning(true)
          }}
        >
          {t('gameFolderDetails.rescan')}
        </Button>
      </div>
    </FocusGroup>
  )
}
