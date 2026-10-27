import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { setPlatformEnabled } from '@renderer/core/ipc'
import { useFocusable } from '@renderer/core/navigation'
import type { InstalledPlatform } from '@renderer/types/installedPlatform'

import styles from '../PlatformDetailsSettings.module.css'

export interface PlatformEnabledSwitchProps {
  platform: InstalledPlatform
}

/**
 * Turns the platform on or off: the whole row is the switch, with what being off means below
 * its label and a toggle drawn on the right; focused when the screen opens. The change is
 * kept at once; when it can't be, the switch stays as it was and says so.
 */
export function PlatformEnabledSwitch({ platform }: PlatformEnabledSwitchProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: 'enabled', autoFocus: true })
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)
  const labelId = useId()
  const hintId = useId()
  const problemId = useId()

  const toggle = async (): Promise<void> => {
    if (saving) return
    setSaving(true)
    setFailed(false)
    try {
      await setPlatformEnabled(platform.id, !platform.isEnabled)
    } catch {
      setFailed(true)
    }
    setSaving(false)
  }

  return (
    <div className={styles.enabled}>
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={platform.isEnabled}
        aria-labelledby={labelId}
        aria-describedby={failed ? `${hintId} ${problemId}` : hintId}
        className={styles.switch}
        onClick={toggle}
      >
        <span className={styles.switchText}>
          <span id={labelId} className={styles.switchLabel}>
            {t('platformDetails.enabled')}
          </span>
          <span id={hintId} className={styles.switchHint}>
            {t('platformDetails.enabledHint')}
          </span>
        </span>
        <span className={styles.toggle} aria-hidden>
          <span className={styles.knob} />
        </span>
      </button>
      {failed && (
        <p id={problemId} role="alert" className={styles.problem}>
          {t('platformDetails.enableFailed')}
        </p>
      )}
    </div>
  )
}
