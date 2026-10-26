import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { FocusGroup } from '@renderer/core/navigation'

import { saveProblemMessageKey } from '../../utils/gameFolderProblems'
import { ScannedGameItem } from './components/ScannedGameItem'
import { ScanProgressBar } from './components/ScanProgressBar'
import { ScanSummary } from './components/ScanSummary'
import { useFolderScan } from './FolderScanResults.hooks'
import type { FolderScanResultsProps } from './FolderScanResults.types'
import styles from './FolderScanResults.module.css'

/**
 * The step that scans a game folder (to add it, or again to update it): the folder is
 * scanned with a progress bar, then the games found are listed, damaged ones marked with why.
 * The save action keeps the playable ones and is unavailable while there are none; Back
 * returns to the previous step.
 */
export function FolderScanResults({
  path,
  platformName,
  scan: startScan,
  save: saveScan,
  saveLabel,
  onBack,
  onFailed,
  onSaved
}: FolderScanResultsProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { scan, percent, playableCount, canSave, saveProblem, save } = useFolderScan(
    startScan,
    saveScan,
    onFailed,
    onSaved
  )
  const titleId = useId()

  return (
    <FocusGroup id="folder-scan" className={styles.content}>
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {scan ? t('folderScan.found') : t('folderScan.scanning')}
        </h2>
        <p className={styles.folder}>{t('folderScan.folder', { path, platform: platformName })}</p>
      </div>
      {scan ? (
        <ScanSummary games={scan.games} playableCount={playableCount} />
      ) : (
        <ScanProgressBar percent={percent} labelId={titleId} />
      )}
      {scan && scan.games.length > 0 && (
        <ul className={styles.list}>
          {scan.games.map((game) => (
            <li key={game.relativePath}>
              <ScannedGameItem game={game} />
            </li>
          ))}
        </ul>
      )}
      <div className={styles.footer}>
        {saveProblem && (
          <p role="alert" className={styles.error}>
            {t(saveProblemMessageKey(saveProblem))}
          </p>
        )}
        <div className={styles.actions}>
          <Button focusId="back" autoFocus onPress={onBack}>
            {t('folderScan.back')}
          </Button>
          <Button focusId="save" aria-disabled={!canSave} onPress={save}>
            {saveLabel}
          </Button>
        </div>
      </div>
    </FocusGroup>
  )
}
