import { TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { Button } from '@renderer/components/Button'
import { useEmulators } from '@renderer/core/ipc'
import { FocusGroup, useGoBack } from '@renderer/core/navigation'

import { SettingsEmptyState } from '../components/SettingsEmptyState'
import { EmulatorPath } from './components/EmulatorPath'
import { OpenEmulator } from './components/OpenEmulator'
import { RemoveEmulator } from './components/RemoveEmulator'
import styles from './EmulatorDetailsSettings.module.css'

/**
 * An emulator's details, a screen inside Settings opened from the emulators list: its name and
 * version with Open emulator below, its application's path with a way to change it, removing
 * it apart at the end, and Back at the bottom; focus goes down and up through them row by row.
 * Says so when the emulator is no longer there.
 */
export function EmulatorDetailsSettings(): React.JSX.Element | null {
  const { t } = useTranslation('settings')
  const { emulatorId } = useParams()
  const { status, emulators } = useEmulators()
  const emulator = emulators.find((candidate) => candidate.id === emulatorId)
  // As the back action does.
  const returnToList = useGoBack()

  const back = (
    <Button focusId="back" onPress={returnToList}>
      {t('emulatorDetails.back')}
    </Button>
  )

  if (!emulator && status === 'loading') return null

  if (!emulator) {
    return (
      <FocusGroup id="emulator-details" className={styles.missing}>
        <SettingsEmptyState
          icon={TriangleAlert}
          title={t('emulatorDetails.notFound')}
          action={back}
        />
      </FocusGroup>
    )
  }

  return (
    <FocusGroup id="emulator-details" movement="rows" className={styles.content}>
      <div className={styles.header}>
        <h2 className={styles.title}>{emulator.name}</h2>
        {emulator.version && (
          <p className={styles.version}>{t('emulators.version', { version: emulator.version })}</p>
        )}
      </div>
      <OpenEmulator emulator={emulator} />
      <EmulatorPath emulator={emulator} />
      <RemoveEmulator emulator={emulator} onRemoved={returnToList} />
      <div className={styles.actions}>{back}</div>
    </FocusGroup>
  )
}
