import { Button } from '@renderer/components/Button'
import { FocusGroup } from '@renderer/core/navigation'

import type { SetupPanelProps } from './SetupPanel.types'
import styles from './SetupPanel.module.css'

/**
 * A step of setting Ilnamiki up, shown on Home while something needed to play is missing:
 * an icon, what is missing, how to get it and the action, focused, that gets it.
 */
export function SetupPanel({
  id,
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: SetupPanelProps): React.JSX.Element {
  return (
    <FocusGroup id={id} as="section" className={styles.panel}>
      <Icon className={styles.icon} aria-hidden />
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>
        <Button focusId="action" autoFocus onPress={onAction}>
          {actionLabel}
        </Button>
      </div>
    </FocusGroup>
  )
}
