import { Gamepad2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { useInputAction } from '@renderer/core/input'

import { EMULATOR_SETUP_ACTIONS } from './EmulatorSetup.constants'
import styles from './EmulatorSetup.module.css'

export function EmulatorSetup(): React.JSX.Element {
  const { t } = useTranslation('home')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useInputAction((action) => {
    if (action === 'up') setSelectedIndex((index) => Math.max(index - 1, 0))
    if (action === 'down') {
      setSelectedIndex((index) => Math.min(index + 1, EMULATOR_SETUP_ACTIONS.length - 1))
    }
  })

  return (
    <section className={styles.panel}>
      <Gamepad2 className={styles.icon} aria-hidden />
      <h2 className={styles.title}>{t('emulatorSetup.title')}</h2>
      <p className={styles.description}>{t('emulatorSetup.description')}</p>
      <div className={styles.actions}>
        {EMULATOR_SETUP_ACTIONS.map((setupAction, index) => (
          <Button
            key={setupAction.id}
            focused={index === selectedIndex}
            onMouseEnter={() => setSelectedIndex(index)}
            onFocus={() => setSelectedIndex(index)}
          >
            {t(setupAction.labelKey)}
          </Button>
        ))}
      </div>
    </section>
  )
}
