import { FocusGroup } from '@renderer/core/navigation'

import { SettingsFormHeader } from './components/SettingsFormHeader'
import type { SettingsFormProps } from './SettingsForm.types'
import styles from './SettingsForm.module.css'

/**
 * A settings form, shown in the content panel: its title and keyboard note at the top, then
 * its fields, and its actions at the bottom right.
 */
export function SettingsForm({
  id,
  title,
  actions,
  children
}: SettingsFormProps): React.JSX.Element {
  return (
    <div className={styles.content}>
      <SettingsFormHeader title={title} />
      <FocusGroup id={id} className={styles.form}>
        <div className={styles.fields}>{children}</div>
        <div className={styles.actions}>{actions}</div>
      </FocusGroup>
    </div>
  )
}
