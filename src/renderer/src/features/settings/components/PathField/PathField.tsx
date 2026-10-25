import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FormField } from '../FormField'
import { FormTextInput } from '../FormTextInput'
import { BrowseButton } from './components/BrowseButton'
import type { PathFieldProps } from './PathField.types'
import styles from './PathField.module.css'

/**
 * A path, typed or chosen with the system's picker from the button at its end, which fills it
 * in. Cancelling the picker keeps the path. Below it shows that the picker couldn't open, or
 * else the problem it is given.
 */
export function PathField({
  label,
  browseLabel,
  value,
  onChange,
  pick,
  onPick,
  error,
  autoFocus = false
}: PathFieldProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [pickFailed, setPickFailed] = useState(false)
  const inputId = useId()
  const errorId = useId()
  const message = pickFailed ? t('form.pickError') : error

  const browse = async (): Promise<void> => {
    setPickFailed(false)
    try {
      const pickedPath = await pick()
      if (pickedPath === null) return
      onChange(pickedPath)
      onPick?.(pickedPath)
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
          aria-describedby={message ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          onChange={onChange}
        />
        <BrowseButton label={browseLabel} onPress={browse} />
      </div>
      {message && (
        <p id={errorId} role="alert" className={styles.error}>
          {message}
        </p>
      )}
    </FormField>
  )
}
