import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import type { PlatformListItemProps } from '../PlatformSettings.types'
import styles from '../PlatformSettings.module.css'

/**
 * A platform as a switch: its name, the cores that play it and the extensions they play (when
 * they say), and a toggle drawn on the right. The whole row is the switch, so confirming it
 * anywhere turns the platform on or off. Every platform starts on, and the switch only
 * changes what it shows for now; nothing is saved.
 */
export function PlatformListItem({ platform }: PlatformListItemProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: platform.id })
  const [enabled, setEnabled] = useState(true)
  const nameId = useId()
  const coresId = useId()
  const extensionsId = useId()
  // Every extension the platform's cores play, once each, in the order they declare them.
  const extensions = [...new Set(platform.cores.flatMap((core) => core.extensions))]
  const hasExtensions = extensions.length > 0

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-labelledby={nameId}
      aria-describedby={hasExtensions ? `${coresId} ${extensionsId}` : coresId}
      className={styles.item}
      onClick={() => setEnabled((on) => !on)}
    >
      <span className={styles.info}>
        <span id={nameId} className={styles.name}>
          {platform.name}
        </span>
        <span id={coresId} className={styles.detail}>
          {t('platforms.cores', {
            count: platform.cores.length,
            cores: platform.cores.map((core) => core.name).join(' · ')
          })}
        </span>
        {hasExtensions && (
          <span id={extensionsId} className={styles.detail}>
            {t('platforms.extensions', { extensions: extensions.join(' · ') })}
          </span>
        )}
      </span>
      <span className={styles.toggle} aria-hidden>
        <span className={styles.knob} />
      </span>
    </button>
  )
}
