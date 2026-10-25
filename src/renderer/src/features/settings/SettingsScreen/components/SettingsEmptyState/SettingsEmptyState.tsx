import type { SettingsEmptyStateProps } from './SettingsEmptyState.types'
import styles from './SettingsEmptyState.module.css'

/**
 * Shown instead of a category's content when there is nothing in it yet: what is missing, how
 * to get it and, optionally, an action. Centered in the room the content would take.
 */
export function SettingsEmptyState({
  icon: Icon,
  title,
  description,
  action
}: SettingsEmptyStateProps): React.JSX.Element {
  return (
    <section className={styles.empty}>
      <Icon className={styles.icon} aria-hidden />
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </section>
  )
}
