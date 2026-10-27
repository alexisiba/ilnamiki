import type { ExtensionBadgesProps } from './ExtensionBadges.types'
import styles from './ExtensionBadges.module.css'

/** File extensions as a wrapping row of pill-shaped badges, in the order given. */
export function ExtensionBadges({ extensions }: ExtensionBadgesProps): React.JSX.Element {
  return (
    <ul className={styles.extensions}>
      {extensions.map((extension) => (
        <li key={extension} className={styles.extension}>
          {extension}
        </li>
      ))}
    </ul>
  )
}
