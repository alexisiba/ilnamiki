import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { SECTION_PATHS } from '@renderer/core/navigation'

import { EmulatorForm } from './components/EmulatorForm'
import { KeyboardNote } from './components/KeyboardNote'
import styles from './AddEmulatorScreen.module.css'

/** The form that adds an emulator, opened from Settings. Filled with a keyboard and mouse. */
export function AddEmulatorScreen(): React.JSX.Element {
  const { t } = useTranslation('settings')
  const navigate = useNavigate()

  return (
    <div className={styles.screen}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('addEmulator.title')}</h1>
          <KeyboardNote />
        </div>
        {/* Back returns to Settings, as the back action does. */}
        <EmulatorForm onBack={() => navigate(SECTION_PATHS.settings, { replace: true })} />
      </div>
    </div>
  )
}
