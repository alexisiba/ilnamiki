import { useTranslation } from 'react-i18next'

import type { ScanProgressBarProps } from '../FolderScanResults.types'
import styles from '../FolderScanResults.module.css'

/** How far the scan is: a bar named by the heading, and its percent beside it. */
export function ScanProgressBar({ percent, labelId }: ScanProgressBarProps): React.JSX.Element {
  const { t } = useTranslation('settings')

  return (
    <div className={styles.progress}>
      <progress className={styles.bar} max={100} value={percent} aria-labelledby={labelId} />
      {/* The bar already tells assistive technology its value. */}
      <span className={styles.percent} aria-hidden>
        {t('folderScan.percent', { percent })}
      </span>
    </div>
  )
}
