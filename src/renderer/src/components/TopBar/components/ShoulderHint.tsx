import type { ShoulderHintProps } from '../TopBar.types'
import styles from '../TopBar.module.css'

export function ShoulderHint({ label, onPress }: ShoulderHintProps): React.JSX.Element {
  return (
    <button type="button" className={styles.shoulderHint} onClick={onPress}>
      {label}
    </button>
  )
}
