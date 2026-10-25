import { TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { Button } from '@renderer/components/Button'
import { useEmulators } from '@renderer/core/ipc'
import { FocusGroup, SECTION_PATHS } from '@renderer/core/navigation'

import { SettingsEmptyState } from '../components/SettingsEmptyState'
import { EmulatorPath } from './components/EmulatorPath'
import { RemoveEmulator } from './components/RemoveEmulator'
import styles from './EmulatorDetailsSettings.module.css'

/**
 * An emulator's details, opened from the emulators list in the Settings content panel: its
 * name and version, its application's path with a way to change it, and the action to remove
 * it. Says so when the emulator is no longer there.
 */
export function EmulatorDetailsSettings(): React.JSX.Element | null {
  const { t } = useTranslation('settings')
  const navigate = useNavigate()
  const { emulatorId } = useParams()
  const { status, emulators } = useEmulators()
  const emulator = emulators.find((candidate) => candidate.id === emulatorId)

  // As the back action does.
  const returnToList = (): void => {
    navigate(SECTION_PATHS.settings, { replace: true })
  }

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
    <FocusGroup id="emulator-details" className={styles.content}>
      <div className={styles.header}>
        <h2 className={styles.title}>{emulator.name}</h2>
        {emulator.version && (
          <p className={styles.version}>{t('emulators.version', { version: emulator.version })}</p>
        )}
      </div>
      <EmulatorPath emulator={emulator} />
      <div className={styles.actions}>
        {back}
        <RemoveEmulator emulator={emulator} onRemoved={returnToList} />
      </div>
    </FocusGroup>
  )
}
