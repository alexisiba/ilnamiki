import { Link } from 'react-router'

import type { TopBarTabProps } from '../TopBar.types'
import styles from '../TopBar.module.css'

/**
 * Link to a top-level section; sections replace each other instead of stacking history. It
 * stays current on every screen of its section, not only on the section root.
 */
export function TopBarTab({ label, path, active }: TopBarTabProps): React.JSX.Element {
  return (
    <Link
      to={path}
      replace
      aria-current={active ? 'page' : undefined}
      className={active ? `${styles.tab} ${styles.tabActive}` : styles.tab}
    >
      {label}
    </Link>
  )
}
