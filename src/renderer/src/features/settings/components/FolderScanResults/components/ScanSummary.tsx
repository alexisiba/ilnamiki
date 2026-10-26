import { TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { ScanSummaryProps } from '../FolderScanResults.types'
import styles from '../FolderScanResults.module.css'

/**
 * What the scan found, announced when it ends: how many games can be played and how many are
 * damaged, or, when none can be played, that there is nothing to save.
 */
export function ScanSummary({ games, playableCount }: ScanSummaryProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const damagedCount = games.length - playableCount
  const counts = [
    playableCount > 0 && t('folderScan.games', { count: playableCount }),
    damagedCount > 0 && t('folderScan.damaged', { count: damagedCount })
  ].filter(Boolean)

  return (
    <div role="status" className={styles.summary}>
      {counts.length > 0 && <p className={styles.counts}>{counts.join(' · ')}</p>}
      {playableCount === 0 && (
        <p className={styles.warning}>
          <TriangleAlert className={styles.warningIcon} aria-hidden />
          {games.length === 0 ? t('folderScan.noGames') : t('folderScan.noPlayableGames')}
        </p>
      )}
    </div>
  )
}
