import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import { getPlatformExtensions } from '../../../../utils/platformExtensions'
import type { PlatformListItemProps } from '../PlatformSettings.types'
import styles from '../PlatformSettings.module.css'

/**
 * A platform: its name, the cores that play it and the extensions they play (when they say),
 * with a dot at the top right, filled and glowing while it is on and a grey hollow ring while it
 * is off, also said in words for assistive technologies. Confirming it opens its details.
 */
export function PlatformListItem({ platform, onOpen }: PlatformListItemProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: platform.id })
  const nameId = useId()
  const coresId = useId()
  const extensionsId = useId()
  const statusId = useId()
  const extensions = getPlatformExtensions(platform)
  const describedBy = [coresId, extensions.length > 0 && extensionsId, statusId]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={ref}
      type="button"
      aria-labelledby={nameId}
      aria-describedby={describedBy}
      className={styles.item}
      onClick={onOpen}
    >
      <span className={platform.isEnabled ? styles.enabledDot : styles.disabledDot} aria-hidden />
      {/* The dot's meaning in words: hidden, but read as part of the description. */}
      <span id={statusId} hidden>
        {platform.isEnabled ? t('platforms.enabled') : t('platforms.disabled')}
      </span>
      <span id={nameId} className={styles.name}>
        {platform.name}
      </span>
      <span id={coresId} className={styles.detail}>
        {t('platforms.cores', {
          count: platform.cores.length,
          cores: platform.cores.map((core) => core.name).join(' · ')
        })}
      </span>
      {extensions.length > 0 && (
        <span id={extensionsId} className={styles.detail}>
          {t('platforms.extensions', { extensions: extensions.join(' · ') })}
        </span>
      )}
    </button>
  )
}
