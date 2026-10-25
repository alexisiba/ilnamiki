import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ScanFolderRequest } from '@shared/api'

import { addGameFolder, scanGameFolder, useGameFolders, usePlatforms } from '@renderer/core/ipc'
import { useBackStep, useGoBack } from '@renderer/core/navigation'

import { FolderScanResults } from '../components/FolderScanResults'
import { scanProblemMessageKey, type FolderScanProblem } from '../utils/gameFolderProblems'
import { GameFolderForm } from './components/GameFolderForm'

/**
 * Adds a game folder, a screen inside Settings opened from the game folders list, in two
 * steps: the form (filled with a keyboard and mouse), then the results of scanning the folder,
 * where it is saved. Back, and Back in the results, return to the form as it was; a folder
 * that can't be scanned returns to it too, saying why.
 */
export function AddGameFolderSettings(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { platforms } = usePlatforms()
  const { folders } = useGameFolders()
  // Cancel, and saving the folder, return to the game folders list, as the back action does.
  const returnToList = useGoBack()
  // The folder and platform last scanned: the form starts from them when it comes back.
  const [request, setRequest] = useState<ScanFolderRequest>()
  const [scanning, setScanning] = useState(false)
  const [problem, setProblem] = useState<FolderScanProblem>()

  const returnToForm = (): void => setScanning(false)
  useBackStep(scanning ? returnToForm : undefined)

  // A platform has one folder at most: those that have one can't be chosen.
  const choosablePlatforms = platforms.filter(
    (platform) => !folders.some((folder) => folder.platformId === platform.id)
  )

  if (scanning && request) {
    const platform = platforms.find(({ id }) => id === request.platformId)
    return (
      <FolderScanResults
        path={request.path}
        platformName={platform?.name ?? request.platformId}
        scan={() => scanGameFolder(request)}
        save={addGameFolder}
        saveLabel={t('folderScan.save')}
        onBack={returnToForm}
        onFailed={(scanProblem) => {
          setProblem(scanProblem)
          setScanning(false)
        }}
        onSaved={returnToList}
      />
    )
  }

  return (
    <GameFolderForm
      platforms={choosablePlatforms}
      initialPath={request?.path ?? ''}
      initialPlatformId={request?.platformId}
      problemMessage={problem && t(scanProblemMessageKey(problem))}
      onCancel={returnToList}
      onScan={(nextRequest) => {
        setRequest(nextRequest)
        setProblem(undefined)
        setScanning(true)
      }}
    />
  )
}
