import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FormField } from '../FormField'
import { FormTextInput } from '../FormTextInput'
import { BrowseButton } from './components/BrowseButton'
import type { PathFieldProps } from './PathField.types'
import styles from './PathField.module.css'

/**
 * A path, typed or chosen with the system's picker from the button at its end, which fills it
 * in. Cancelling the picker keeps the path; a picker that can't open says so below.
 */
export function PathField({
  label,
  browseLabel,
  value,
  onChange,
  pick,
  autoFocus = false
}: PathFieldProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [pickFailed, setPickFailed] = useState(false)
  const inputId = useId()
  const errorId = useId()

  const browse = async (): Promise<void> => {
    setPickFailed(false)
    try {
      const pickedPath = await pick()
      if (pickedPath !== null) onChange(pickedPath)
    } catch {
      setPickFailed(true)
    }
  }

  return (
    <FormField label={label} controlId={inputId}>
      <div className={styles.row}>
        <FormTextInput
          id={inputId}
          focusId="path"
          autoFocus={autoFocus}
          value={value}
          aria-describedby={pickFailed ? errorId : undefined}
          onChange={onChange}
        />
        <BrowseButton label={browseLabel} onPress={browse} />
      </div>
      {pickFailed && (
        <p id={errorId} role="alert" className={styles.error}>
          {t('form.pickError')}
        </p>
      )}
    </FormField>
  )
}
