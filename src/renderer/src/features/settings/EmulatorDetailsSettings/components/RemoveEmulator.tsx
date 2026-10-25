import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { removeEmulator } from '@renderer/core/ipc'

import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { RemoveEmulatorProps } from '../EmulatorDetailsSettings.types'
import styles from '../EmulatorDetailsSettings.module.css'

/**
 * Removing the emulator, a section of its own at the end, apart from the other actions: what
 * removing does, and Remove emulator below, in red, which asks before removing it from
 * Ilnamiki.
 */
export function RemoveEmulator({ emulator, onRemoved }: RemoveEmulatorProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [confirming, setConfirming] = useState(false)
  const labelId = useId()
  const descriptionId = useId()

  const remove = async (): Promise<void> => {
    setConfirming(false)
    await removeEmulator(emulator.id)
    onRemoved()
  }

  return (
    <section className={styles.removal} aria-labelledby={labelId}>
      <div className={styles.removalText}>
        <h3 id={labelId} className={styles.label}>
          {t('emulatorDetails.removal.title')}
        </h3>
        <p id={descriptionId} className={styles.removalDescription}>
          {t('emulatorDetails.removal.description')}
        </p>
      </div>
      <Button
        focusId="remove"
        variant="danger"
        aria-describedby={descriptionId}
        onPress={() => setConfirming(true)}
      >
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
    </section>
  )
}
