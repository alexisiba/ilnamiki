import { FolderOpen } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { changeEmulatorPath, pickEmulatorExecutable } from '@renderer/core/ipc'

import { emulatorProblemMessageKey, type EmulatorProblem } from '../../utils/emulatorProblems'
import type { EmulatorPathProps } from '../EmulatorDetailsSettings.types'
import styles from '../EmulatorDetailsSettings.module.css'

/**
 * The emulator's application path, and Change path, which opens the system's file picker and
 * saves the chosen application at once. A problem with it shows below, and nothing changes.
 */
export function EmulatorPath({ emulator }: EmulatorPathProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [problem, setProblem] = useState<EmulatorProblem>()
  const labelId = useId()
  const pathId = useId()
  const problemId = useId()

  const change = async (): Promise<void> => {
    setProblem(undefined)
    try {
      const executablePath = await pickEmulatorExecutable()
      if (executablePath === null || executablePath === emulator.executablePath) return
      const result = await changeEmulatorPath({ id: emulator.id, executablePath })
      if (!result.ok) setProblem(result.problem)
    } catch {
      setProblem('failed')
    }
  }

  return (
    <section className={styles.path} aria-labelledby={labelId}>
      <h3 id={labelId} className={styles.label}>
        {t('emulatorDetails.path')}
      </h3>
      <div className={styles.pathRow}>
        <p id={pathId} className={styles.pathValue}>
          {emulator.executablePath}
        </p>
        <Button
          focusId="change-path"
          aria-describedby={problem ? `${pathId} ${problemId}` : pathId}
          onPress={change}
        >
          <span className={styles.buttonContent}>
            <FolderOpen className={styles.buttonIcon} aria-hidden />
            {t('emulatorDetails.changePath')}
          </span>
        </Button>
      </div>
      {problem && (
        <p id={problemId} role="alert" className={styles.problem}>
          {t(emulatorProblemMessageKey(problem))}
        </p>
      )}
    </section>
  )
}
