import { Joystick } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { FocusGroup, SECTION_PATHS } from '@renderer/core/navigation'

import styles from './LibraryEmpty.module.css'

/**
 * Shown instead of the consoles while none has games: what is missing, how to get it (a
 * folder of games, added in Settings) and the action that opens Settings.
 */
export function LibraryEmpty(): React.JSX.Element {
  const { t } = useTranslation('consoles')
  const navigate = useNavigate()

  return (
    <FocusGroup id="library-empty" as="section" className={styles.empty}>
      <Joystick className={styles.icon} aria-hidden />
      <h2 className={styles.title}>{t('empty.title')}</h2>
      <p className={styles.description}>{t('empty.description')}</p>
      <div className={styles.action}>
        {/* Another section, as its tab opens it: without stacking history. */}
        <Button
          focusId="open-settings"
          autoFocus
          onPress={() => navigate(SECTION_PATHS.settings, { replace: true })}
        >
          {t('empty.openSettings')}
        </Button>
      </div>
    </FocusGroup>
  )
}
