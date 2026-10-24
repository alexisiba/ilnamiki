import { ButtonHint } from '@renderer/components/ButtonHint'

import type { ShoulderHintProps } from '../TopBar.types'
import styles from '../TopBar.module.css'

export function ShoulderHint({ action, onPress }: ShoulderHintProps): React.JSX.Element {
  return (
    <button type="button" className={styles.shoulderHint} onClick={onPress}>
      <ButtonHint action={action} />
    </button>
  )
}
