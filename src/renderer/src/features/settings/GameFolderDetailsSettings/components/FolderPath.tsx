import { FolderOpen, TriangleAlert } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import { scanProblemMessageKey } from '../../utils/gameFolderProblems'
import type { FolderPathProps } from '../GameFolderDetailsSettings.types'
import styles from '../GameFolderDetailsSettings.module.css'

/**
 * The folder's path with Change path beside it, as an emulator's path, and, below it, that
 * the folder isn't available when it is no longer there, and why it couldn't be scanned
 * when it couldn't.
 */
export function FolderPath({ folder, problem, onChangePath }: FolderPathProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const labelId = useId()
  const pathId = useId()
  const problemId = useId()

  return (
    <section className={styles.path} aria-labelledby={labelId}>
      <h3 id={labelId} className={styles.label}>
        {t('gameFolderDetails.path')}
      </h3>
      <div className={styles.pathRow}>
        <p id={pathId} className={styles.pathValue}>
          {folder.path}
        </p>
        <Button
          focusId="change-path"
          aria-describedby={problem ? `${pathId} ${problemId}` : pathId}
          onPress={onChangePath}
        >
          <span className={styles.buttonContent}>
            <FolderOpen className={styles.buttonIcon} aria-hidden />
            {t('gameFolderDetails.changePath')}
          </span>
        </Button>
      </div>
      {!folder.isAvailable && (
        <p className={styles.unavailable}>
          <TriangleAlert className={styles.unavailableIcon} aria-hidden />
          {t('gameFolders.unavailable')}
        </p>
      )}
      {problem && (
        <p id={problemId} role="alert" className={styles.problem}>
          {t(scanProblemMessageKey(problem))}
        </p>
      )}
    </section>
  )
}
