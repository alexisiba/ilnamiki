import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import type { PlatformListItemProps } from '../PlatformSettings.types'
import styles from '../PlatformSettings.module.css'

/**
 * A platform as a switch: its name, core and the extensions the core plays (when it says),
 * and a toggle drawn on the right. The whole row is the switch, so confirming it anywhere
 * turns the platform on or off. It only changes what it shows for now; nothing is saved.
 */
export function PlatformListItem({ platform }: PlatformListItemProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: platform.id })
  const [enabled, setEnabled] = useState(platform.enabled)
  const nameId = useId()
  const coreId = useId()
  const extensionsId = useId()
  const hasExtensions = platform.extensions.length > 0

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-labelledby={nameId}
      aria-describedby={hasExtensions ? `${coreId} ${extensionsId}` : coreId}
      className={styles.item}
      onClick={() => setEnabled((on) => !on)}
    >
      <span className={styles.info}>
        <span id={nameId} className={styles.name}>
          {platform.name}
        </span>
        <span id={coreId} className={styles.detail}>
          {t('platforms.core', { core: platform.core })}
        </span>
        {hasExtensions && (
          <span id={extensionsId} className={styles.detail}>
            {t('platforms.extensions', { extensions: platform.extensions.join(' · ') })}
          </span>
        )}
      </span>
      <span className={styles.toggle} aria-hidden>
        <span className={styles.knob} />
      </span>
    </button>
  )
}
