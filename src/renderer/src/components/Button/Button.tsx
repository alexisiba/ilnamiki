import { useEffect, useRef } from 'react'

import type { ButtonProps } from './Button.types'
import styles from './Button.module.css'

/** Action button: runs something when confirmed. Not for navigation between screens. */
export function Button({
  focused = false,
  onPress,
  children,
  ...buttonProps
}: ButtonProps): React.JSX.Element {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (focused) ref.current?.focus({ preventScroll: true })
  }, [focused])

  return (
    <button
      {...buttonProps}
      ref={ref}
      type="button"
      className={focused ? `${styles.button} ${styles.focused}` : styles.button}
      onClick={onPress}
    >
      {children}
    </button>
  )
}
