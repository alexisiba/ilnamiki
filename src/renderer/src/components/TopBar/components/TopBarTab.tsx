import { NavLink } from 'react-router'

import type { TopBarTabProps } from '../TopBar.types'
import styles from '../TopBar.module.css'

/** Link to a top-level section; sections replace each other instead of stacking history. */
export function TopBarTab({ label, path }: TopBarTabProps): React.JSX.Element {
  return (
    <NavLink
      to={path}
      replace
      end
      className={({ isActive }) => (isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab)}
    >
      {label}
    </NavLink>
  )
}
