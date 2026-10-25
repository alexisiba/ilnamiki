import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { removeEmulator } from '@renderer/core/ipc'

import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { RemoveEmulatorProps } from '../EmulatorDetailsSettings.types'

/** Remove emulator, in red, which asks before removing the emulator from Ilnamiki. */
export function RemoveEmulator({ emulator, onRemoved }: RemoveEmulatorProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [confirming, setConfirming] = useState(false)

  const remove = async (): Promise<void> => {
    setConfirming(false)
    await removeEmulator(emulator.id)
    onRemoved()
  }

  return (
    <>
      <Button focusId="remove" variant="danger" onPress={() => setConfirming(true)}>
        {t('emulatorDetails.remove')}
      </Button>
      {confirming && (
        <ConfirmDialog
          title={t('emulatorDetails.confirmRemove.title', { name: emulator.name })}
          description={t('emulatorDetails.confirmRemove.description')}
          cancelLabel={t('emulatorDetails.confirmRemove.cancel')}
          confirmLabel={t('emulatorDetails.confirmRemove.confirm')}
          destructive
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}
