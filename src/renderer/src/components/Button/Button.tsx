import { useFocusable } from '@renderer/core/navigation'

import type { ButtonProps } from './Button.types'
import styles from './Button.module.css'

/**
 * Action button: runs something when confirmed. Not for navigation between screens. With
 * `aria-disabled`, it stays focusable so the user knows it exists, but does nothing.
 */
export function Button({
  focusId,
  autoFocus = false,
  variant = 'default',
  onPress,
  children,
  ...buttonProps
}: ButtonProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLButtonElement>({ id: focusId, autoFocus })
  const disabled = buttonProps['aria-disabled'] === true || buttonProps['aria-disabled'] === 'true'

  return (
    <button
      {...buttonProps}
      ref={ref}
      type="button"
      className={variant === 'danger' ? `${styles.button} ${styles.danger}` : styles.button}
      onClick={disabled ? undefined : onPress}
    >
      {children}
    </button>
  )
}
