import type { FormFieldProps } from './FormField.types'
import styles from './FormField.module.css'

/** A form field: its label above the control, and anything shown below it (e.g. an error). */
export function FormField({
  label,
  controlId,
  labelId,
  children
}: FormFieldProps): React.JSX.Element {
  return (
    <div className={styles.field}>
      <label id={labelId} htmlFor={controlId} className={styles.label}>
        {label}
      </label>
      {children}
    </div>
  )
}
