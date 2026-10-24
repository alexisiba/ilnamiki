import styles from './PlatformPill.module.css'

export interface PlatformPillProps {
  /** Console name, e.g. "Nintendo 64". */
  platform: string
}

/** The console a game runs on, as a pill. */
export function PlatformPill({ platform }: PlatformPillProps): React.JSX.Element {
  return <span className={styles.pill}>{platform}</span>
}
