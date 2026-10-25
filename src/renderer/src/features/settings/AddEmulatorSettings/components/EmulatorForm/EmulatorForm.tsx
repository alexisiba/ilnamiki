import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { pickEmulatorExecutable } from '@renderer/core/ipc'
import { FocusGroup } from '@renderer/core/navigation'

import { BrowseButton } from './components/BrowseButton'
import { FormTextInput } from './components/FormTextInput'
import type { EmulatorFormProps } from './EmulatorForm.types'
import styles from './EmulatorForm.module.css'

/**
 * The path to the emulator's application, which can be typed or chosen with the system's file
 * picker, then the emulator's name. Nothing is validated or saved yet.
 */
export function EmulatorForm({ onBack }: EmulatorFormProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [pickFailed, setPickFailed] = useState(false)
  const nameId = useId()
  const pathId = useId()
  const pickErrorId = useId()

  const browse = async (): Promise<void> => {
    setPickFailed(false)
    try {
      const pickedPath = await pickEmulatorExecutable()
      if (pickedPath !== null) setPath(pickedPath)
    } catch {
      setPickFailed(true)
    }
  }

  return (
    <FocusGroup id="add-emulator-form" className={styles.form}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={pathId} className={styles.label}>
            {t('addEmulator.path')}
          </label>
          <div className={styles.pathRow}>
            <FormTextInput
              id={pathId}
              focusId="path"
              autoFocus
              value={path}
              aria-describedby={pickFailed ? pickErrorId : undefined}
              onChange={setPath}
            />
            <BrowseButton onPress={browse} />
          </div>
          {pickFailed && (
            <p id={pickErrorId} role="alert" className={styles.error}>
              {t('addEmulator.pickError')}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor={nameId} className={styles.label}>
            {t('addEmulator.name')}
          </label>
          <FormTextInput id={nameId} focusId="name" value={name} onChange={setName} />
        </div>
      </div>
      <div className={styles.actions}>
        <Button focusId="back" onPress={onBack}>
          {t('addEmulator.back')}
        </Button>
        <Button focusId="add">{t('addEmulator.add')}</Button>
      </div>
    </FocusGroup>
  )
}
