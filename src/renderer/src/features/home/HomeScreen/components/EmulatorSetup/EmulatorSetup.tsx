import { Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { FocusGroup } from '@renderer/core/navigation'

import { EMULATOR_SETUP_ACTIONS } from './EmulatorSetup.constants'
import styles from './EmulatorSetup.module.css'

export function EmulatorSetup(): React.JSX.Element {
  const { t } = useTranslation('home')

  return (
    <FocusGroup id="emulator-setup" as="section" className={styles.panel}>
      <Gamepad2 className={styles.icon} aria-hidden />
      <h2 className={styles.title}>{t('emulatorSetup.title')}</h2>
      <p className={styles.description}>{t('emulatorSetup.description')}</p>
      <div className={styles.actions}>
        {EMULATOR_SETUP_ACTIONS.map((setupAction, index) => (
          <Button key={setupAction.id} focusId={setupAction.id} autoFocus={index === 0}>
            {t(setupAction.labelKey)}
          </Button>
        ))}
      </div>
    </FocusGroup>
  )
}
