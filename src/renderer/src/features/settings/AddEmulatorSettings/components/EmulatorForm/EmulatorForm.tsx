import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { pickEmulatorExecutable } from '@renderer/core/ipc'

import { FormField } from '../../../components/FormField'
import { FormTextInput } from '../../../components/FormTextInput'
import { PathField } from '../../../components/PathField'
import { SettingsForm } from '../../../components/SettingsForm'
import { emulatorProblemMessageKey } from '../../../utils/emulatorProblems'
import { useEmulatorForm } from './EmulatorForm.hooks'
import type { EmulatorFormProps } from './EmulatorForm.types'

/**
 * The path to the emulator's application, typed or chosen with the system's file picker, then
 * the emulator's name, filled in from the application when it declares one. Add emulator is
 * unavailable until both are filled in; problems with the application show below its path.
 */
export function EmulatorForm({ onBack, onAdded }: EmulatorFormProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const form = useEmulatorForm(onAdded)
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
          <Button focusId="add" aria-disabled={!form.canAdd} onPress={form.add}>
            {t('addEmulator.add')}
          </Button>
        </>
      }
    >
      <PathField
        label={t('addEmulator.path')}
        browseLabel={t('addEmulator.browse')}
        value={form.path}
        onChange={form.changePath}
        pick={pickEmulatorExecutable}
        onPick={form.inspectPicked}
        error={form.problem && t(emulatorProblemMessageKey(form.problem))}
        autoFocus
      />
      <FormField label={t('addEmulator.name')} controlId={nameId}>
        <FormTextInput id={nameId} focusId="name" value={form.name} onChange={form.changeName} />
      </FormField>
    </SettingsForm>
  )
}
