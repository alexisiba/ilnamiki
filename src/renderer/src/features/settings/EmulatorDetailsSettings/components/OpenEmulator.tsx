import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { OpenEmulatorProblem } from '@shared/api'

import { Button } from '@renderer/components/Button'
import { openEmulator } from '@renderer/core/ipc'

import type { OpenEmulatorProps } from '../EmulatorDetailsSettings.types'
import styles from '../EmulatorDetailsSettings.module.css'

/** Why the emulator didn't open: what main reports, or a failure to reach main. */
type OpenProblem = OpenEmulatorProblem | 'failed'

const PROBLEM_KEYS: Record<OpenProblem, string> = {
  'unknown-emulator': 'emulatorDetails.openProblems.unknownEmulator',
  'already-running': 'emulatorDetails.openProblems.alreadyRunning',
  'not-started': 'emulatorDetails.openProblems.notStarted',
  failed: 'emulatorDetails.openProblems.failed'
}

/**
 * Open emulator, which opens the emulator on its own, in full screen, to set it up in its
 * menus; Ilnamiki comes back when it closes. The screen's main action, focused when it opens.
 * Why it didn't open shows below.
 */
export function OpenEmulator({ emulator }: OpenEmulatorProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [problem, setProblem] = useState<OpenProblem>()
  const problemId = useId()

  const open = async (): Promise<void> => {
    setProblem(undefined)
    try {
      const result = await openEmulator(emulator.id)
      if (!result.ok) setProblem(result.problem)
    } catch {
      setProblem('failed')
    }
  }

  return (
    <div className={styles.open}>
      <Button
        focusId="open"
        autoFocus
        aria-describedby={problem ? problemId : undefined}
        onPress={open}
      >
        {t('emulatorDetails.open')}
      </Button>
      {problem && (
        <p id={problemId} role="alert" className={styles.problem}>
          {t(PROBLEM_KEYS[problem])}
        </p>
      )}
    </div>
  )
}
