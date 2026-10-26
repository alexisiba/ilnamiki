import { TriangleAlert } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { Button } from '@renderer/components/Button'
import { usePlatforms } from '@renderer/core/ipc'
import { FocusGroup, useGoBack } from '@renderer/core/navigation'

import { SettingsEmptyState } from '../components/SettingsEmptyState'
import { getPlatformExtensions } from '../utils/platformExtensions'
import styles from './PlatformDetailsSettings.module.css'

/**
 * An installed platform's details, a screen inside Settings opened from the platforms list:
 * its name and maker, the extensions its cores play (saying so when they don't say), the
 * cores that play it, and Back at the bottom, focused, as nothing here changes yet. Says so
 * when the platform is no longer installed.
 */
export function PlatformDetailsSettings(): React.JSX.Element | null {
  const { t } = useTranslation('settings')
  const { platformId } = useParams()
  const { status, platforms } = usePlatforms()
  const platform = platforms.find((candidate) => candidate.id === platformId)
  // As the back action does.
  const returnToList = useGoBack()
  const extensionsId = useId()
  const coresId = useId()

  const back = (
    <Button focusId="back" autoFocus onPress={returnToList}>
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
          action={back}
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
      <section className={styles.section} aria-labelledby={coresId}>
        <h3 id={coresId} className={styles.label}>
          {t('platformDetails.cores')}
        </h3>
        <ul className={styles.cores}>
          {platform.cores.map((core) => (
            <li key={`${core.emulatorId}/${core.id}`} className={styles.core}>
              {core.name}
            </li>
          ))}
        </ul>
      </section>
      <div className={styles.actions}>{back}</div>
    </FocusGroup>
  )
}
