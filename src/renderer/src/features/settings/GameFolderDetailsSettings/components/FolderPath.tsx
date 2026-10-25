import { TriangleAlert } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { scanProblemMessageKey } from '../../utils/gameFolderProblems'
import type { FolderPathProps } from '../GameFolderDetailsSettings.types'
import styles from '../GameFolderDetailsSettings.module.css'

/**
 * The folder's path and, below it, that the folder isn't available when it is no longer
 * there, and why it couldn't be scanned again when it couldn't.
 */
export function FolderPath({ folder, problem }: FolderPathProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const labelId = useId()

  return (
    <section className={styles.path} aria-labelledby={labelId}>
      <h3 id={labelId} className={styles.label}>
        {t('gameFolderDetails.path')}
      </h3>
      <p className={styles.pathValue}>{folder.path}</p>
      {!folder.isAvailable && (
        <p className={styles.unavailable}>
          <TriangleAlert className={styles.unavailableIcon} aria-hidden />
          {t('gameFolders.unavailable')}
        </p>
      )}
      {problem && (
        <p role="alert" className={styles.problem}>
          {t(scanProblemMessageKey(problem))}
        </p>
      )}
    </section>
  )
}
