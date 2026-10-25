import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { pickEmulatorExecutable } from '@renderer/core/ipc'

import { FormField } from '../../../components/FormField'
import { FormTextInput } from '../../../components/FormTextInput'
import { PathField } from '../../../components/PathField'
import { SettingsForm } from '../../../components/SettingsForm'
import type { EmulatorFormProps } from './EmulatorForm.types'

/**
 * The path to the emulator's application, which can be typed or chosen with the system's file
 * picker, then the emulator's name. Nothing is validated or saved yet.
 */
export function EmulatorForm({ onBack }: EmulatorFormProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const nameId = useId()

  return (
    <SettingsForm
      id="add-emulator-form"
      title={t('addEmulator.title')}
      actions={
        <>
          <Button focusId="back" onPress={onBack}>
            {t('addEmulator.back')}
          </Button>
          <Button focusId="add">{t('addEmulator.add')}</Button>
        </>
      }
    >
      <PathField
        label={t('addEmulator.path')}
        browseLabel={t('addEmulator.browse')}
        value={path}
        onChange={setPath}
        pick={pickEmulatorExecutable}
        autoFocus
      />
      <FormField label={t('addEmulator.name')} controlId={nameId}>
        <FormTextInput id={nameId} focusId="name" value={name} onChange={setName} />
      </FormField>
    </SettingsForm>
  )
}
