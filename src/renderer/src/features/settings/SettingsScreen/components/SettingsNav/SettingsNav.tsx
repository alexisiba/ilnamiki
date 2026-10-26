import { useTranslation } from 'react-i18next'

import { FocusGroup } from '@renderer/core/navigation'

import { SETTINGS_CATEGORIES, SETTINGS_NAV_GROUP_ID } from '../../SettingsScreen.constants'
import { SettingsNavTab } from './components/SettingsNavTab'
import type { SettingsNavProps } from './SettingsNav.types'
import styles from './SettingsNav.module.css'

/**
 * The settings categories as vertical tabs: focusing one selects it and shows its content,
 * confirming or clicking it enters that content. Directions stay in the list.
 */
export function SettingsNav({
  selectedId,
  panelId,
  getTabId,
  onSelect,
  onEnter
}: SettingsNavProps): React.JSX.Element {
  const { t } = useTranslation('settings')

  return (
    <FocusGroup id={SETTINGS_NAV_GROUP_ID} contained>
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label={t('categories.label')}
        className={styles.list}
      >
        {SETTINGS_CATEGORIES.map((category) => (
          <SettingsNavTab
            key={category.id}
            category={category}
            selected={category.id === selectedId}
            tabId={getTabId(category.id)}
            panelId={panelId}
            onSelect={() => onSelect(category.id)}
            onEnter={onEnter}
          />
        ))}
      </div>
    </FocusGroup>
  )
}
