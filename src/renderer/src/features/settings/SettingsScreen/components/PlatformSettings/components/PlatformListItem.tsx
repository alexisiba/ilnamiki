import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import { getPlatformExtensions } from '../../../../utils/platformExtensions'
import type { PlatformListItemProps } from '../PlatformSettings.types'
import styles from '../PlatformSettings.module.css'

/**
 * A platform: its name, the cores that play it and the extensions they play (when they say).
 * Confirming it opens its details.
 */
export function PlatformListItem({ platform, onOpen }: PlatformListItemProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: platform.id })
  const nameId = useId()
  const coresId = useId()
  const extensionsId = useId()
  const extensions = getPlatformExtensions(platform)
  const hasExtensions = extensions.length > 0

  return (
    <button
      ref={ref}
      type="button"
      aria-labelledby={nameId}
      aria-describedby={hasExtensions ? `${coresId} ${extensionsId}` : coresId}
      className={styles.item}
      onClick={onOpen}
    >
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
    </button>
  )
}
