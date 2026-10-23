import { useFocusable } from '@renderer/core/navigation'

import type { ButtonProps } from './Button.types'
import styles from './Button.module.css'

/** Action button: runs something when confirmed. Not for navigation between screens. */
export function Button({
  focusId,
  autoFocus = false,
  onPress,
  children,
  ...buttonProps
}: ButtonProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLButtonElement>({ id: focusId, autoFocus })

  return (
    <button {...buttonProps} ref={ref} type="button" className={styles.button} onClick={onPress}>
      {children}
    </button>
  )
}
