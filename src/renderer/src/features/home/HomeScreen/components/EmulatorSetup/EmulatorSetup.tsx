import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
      <h2 className={styles.title}>{t('emulatorSetup.title')}</h2>
      <p className={styles.description}>{t('emulatorSetup.description')}</p>
      <div className={styles.actions}>
        {EMULATOR_SETUP_ACTIONS.map((setupAction, index) => (
          <button
            key={setupAction.id}
            type="button"
            className={
              index === selectedIndex ? `${styles.action} ${styles.actionFocused}` : styles.action
            }
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => setSelectedIndex(index)}
          >
            {t(setupAction.labelKey)}
          </button>
        ))}
      </div>
    </section>
  )
}
