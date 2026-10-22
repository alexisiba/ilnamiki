import type { TopBarTabProps } from '../TopBar.types'
import styles from '../TopBar.module.css'

export function TopBarTab({ label, active, onSelect }: TopBarTabProps): React.JSX.Element {
  return (
    <button
      type="button"
      className={active ? `${styles.tab} ${styles.tabActive}` : styles.tab}
      onClick={onSelect}
    >
      {label}
    </button>
  )
}
