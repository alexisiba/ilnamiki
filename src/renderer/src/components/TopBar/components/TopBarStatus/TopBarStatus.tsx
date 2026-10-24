import { Gamepad2, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useGamepadConnected } from '@renderer/core/input'

import { ControllerPower } from './components/ControllerPower'
import { useCurrentTime } from './TopBarStatus.hooks'
import styles from './TopBarStatus.module.css'

export function TopBarStatus(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const now = useCurrentTime()
  const gamepadConnected = useGamepadConnected()

  const time = new Intl.DateTimeFormat(i18n.language, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(now)

  return (
    <div className={styles.status}>
      <Wifi className={styles.icon} aria-hidden />
      {gamepadConnected && (
        <span className={styles.group}>
          <Gamepad2 className={styles.icon} role="img" aria-label={t('status.gamepadConnected')} />
          <ControllerPower />
        </span>
      )}
      <time className={styles.clock} dateTime={now.toISOString()}>
        {time}
      </time>
    </div>
  )
}
