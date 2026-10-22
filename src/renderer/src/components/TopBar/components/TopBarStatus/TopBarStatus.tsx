import { BatteryFull, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCurrentTime } from './TopBarStatus.hooks'
import styles from './TopBarStatus.module.css'

export function TopBarStatus(): React.JSX.Element {
  const { i18n } = useTranslation()
  const now = useCurrentTime()

  const time = new Intl.DateTimeFormat(i18n.language, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(now)

  return (
    <div className={styles.status}>
      <Wifi className={styles.icon} aria-hidden />
      <BatteryFull className={styles.icon} aria-hidden />
      <time className={styles.clock} dateTime={now.toISOString()}>
        {time}
      </time>
    </div>
  )
}
