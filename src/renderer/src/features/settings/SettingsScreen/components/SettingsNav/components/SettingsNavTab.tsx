import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import type { SettingsNavTabProps } from '../SettingsNav.types'
import styles from '../SettingsNav.module.css'

/**
 * A category tab, selected as soon as it takes focus; confirming or clicking it enters its
 * content. Only the selected one is tabbable.
 */
export function SettingsNavTab({
  category,
  selected,
  tabId,
  panelId,
  onSelect,
  onEnter
}: SettingsNavTabProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: category.id, autoFocus: selected })

  return (
    <button
      ref={ref}
      id={tabId}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={selected ? panelId : undefined}
      tabIndex={selected ? 0 : -1}
      className={styles.tab}
      onFocus={onSelect}
      onClick={onEnter}
    >
      {t(category.labelKey)}
    </button>
  )
}
