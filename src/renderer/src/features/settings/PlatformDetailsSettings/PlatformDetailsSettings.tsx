import { TriangleAlert } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { Button } from '@renderer/components/Button'
import { usePlatforms } from '@renderer/core/ipc'
import { FocusGroup, useGoBack } from '@renderer/core/navigation'

import { SettingsEmptyState } from '../components/SettingsEmptyState'
import { getPlatformExtensions } from '../utils/platformExtensions'
import { PlatformCores } from './components/PlatformCores'
import { PlatformEnabledSwitch } from './components/PlatformEnabledSwitch'
import styles from './PlatformDetailsSettings.module.css'

/**
 * An installed platform's details, a screen inside Settings opened from the platforms list:
 * its name and maker, the switch that turns it on or off, focused, the extensions its cores
 * play (saying so when they don't say), its cores (one to pick as its games' default when it
 * has several), and Back at the bottom; focus moves row by row. Says so when the platform is no longer installed.
 */
export function PlatformDetailsSettings(): React.JSX.Element | null {
  const { t } = useTranslation('settings')
  const { platformId } = useParams()
  const { status, platforms } = usePlatforms()
  const platform = platforms.find((candidate) => candidate.id === platformId)
  // As the back action does.
  const returnToList = useGoBack()
  const extensionsId = useId()

  const back = (autoFocus: boolean): React.JSX.Element => (
    <Button focusId="back" autoFocus={autoFocus} onPress={returnToList}>
      {t('platformDetails.back')}
    </Button>
  )

  if (!platform && status === 'loading') return null

  if (!platform) {
    return (
      <FocusGroup id="platform-details" className={styles.missing}>
        <SettingsEmptyState
          icon={TriangleAlert}
          title={t('platformDetails.notFound')}
          action={back(true)}
        />
      </FocusGroup>
    )
  }

  const extensions = getPlatformExtensions(platform)

  return (
    <FocusGroup id="platform-details" movement="rows" className={styles.content}>
      <div className={styles.header}>
        <h2 className={styles.title}>{platform.name}</h2>
        {platform.manufacturer && <p className={styles.maker}>{platform.manufacturer}</p>}
      </div>
      <PlatformEnabledSwitch platform={platform} />
      <section className={styles.section} aria-labelledby={extensionsId}>
        <h3 id={extensionsId} className={styles.label}>
          {t('platformDetails.extensions')}
        </h3>
        {extensions.length > 0 ? (
          <ul className={styles.extensions}>
            {extensions.map((extension) => (
              <li key={extension} className={styles.extension}>
                {extension}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.message}>{t('platformDetails.noExtensions')}</p>
        )}
      </section>
      <PlatformCores platform={platform} />
      <div className={styles.actions}>{back(false)}</div>
    </FocusGroup>
  )
}
