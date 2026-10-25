import { useFocusable } from '@renderer/core/navigation'

import type { FormTextInputProps } from '../EmulatorForm.types'
import styles from '../EmulatorForm.module.css'

/**
 * A text field typed with a physical keyboard. Pointing at it doesn't focus it, so moving the
 * mouse never takes focus away from the field being typed in; clicking it does.
 */
export function FormTextInput({
  focusId,
  autoFocus = false,
  onChange,
  ...inputProps
}: FormTextInputProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLInputElement>({ id: focusId, autoFocus, focusOnHover: false })

  return (
    <input
      {...inputProps}
      ref={ref}
      type="text"
      className={styles.input}
      spellCheck={false}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
