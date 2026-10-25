import { useTranslation } from 'react-i18next'

import { SETTINGS_CATEGORIES } from '../SettingsScreen.constants'
import type { SettingsInnerScreenProps } from '../SettingsScreen.types'
import styles from '../SettingsScreen.module.css'

/**
 * A screen inside Settings (e.g. adding a game folder), taking the whole width in place of
 * the categories and their content, so focus can't wander to another category while it is
 * open. A trail above it says where it hangs from; back is the way out.
 */
export function SettingsInnerScreen({
  categoryId,
  children
}: SettingsInnerScreenProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const category = SETTINGS_CATEGORIES.find(({ id }) => id === categoryId)

  return (
    <div className={styles.inner}>
      <p className={styles.trail}>
        {t('trail', {
          section: t('navigation.settings', { ns: 'common' }),
          category: category && t(category.labelKey)
        })}
      </p>
      <div className={styles.panel}>{children}</div>
    </div>
  )
}
