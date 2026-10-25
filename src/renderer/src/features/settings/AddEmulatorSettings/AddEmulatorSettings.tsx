import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { SECTION_PATHS } from '@renderer/core/navigation'

import { EmulatorForm } from './components/EmulatorForm'
import { KeyboardNote } from './components/KeyboardNote'
import styles from './AddEmulatorSettings.module.css'

/**
 * The form that adds an emulator, shown in the Settings content panel in place of the
 * emulators list. Filled with a keyboard and mouse.
 */
export function AddEmulatorSettings(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const navigate = useNavigate()

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('addEmulator.title')}</h2>
        <KeyboardNote />
      </div>
      {/* Back returns to the emulators list, as the back action does. */}
      <EmulatorForm onBack={() => navigate(SECTION_PATHS.settings, { replace: true })} />
    </div>
  )
}
