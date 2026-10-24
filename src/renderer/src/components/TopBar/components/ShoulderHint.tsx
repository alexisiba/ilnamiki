import { ButtonHint } from '@renderer/components/ButtonHint'
import { useActionEnabled } from '@renderer/core/input'

import type { ShoulderHintProps } from '../TopBar.types'
import styles from '../TopBar.module.css'

/** The clickable shoulder button, left out while the screen has its action off. */
export function ShoulderHint({ action, onPress }: ShoulderHintProps): React.JSX.Element | null {
  if (!useActionEnabled(action)) return null

  return (
    <button type="button" className={styles.shoulderHint} onClick={onPress}>
      <ButtonHint action={action} />
    </button>
  )
}
