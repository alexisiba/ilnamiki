import { FolderPlus, MonitorCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useOpenSettings } from '@renderer/core/navigation'

import { SetupPanel } from '../SetupPanel'
import type { GameSetupProps } from './GameSetup.types'
import { countLinkedPlatforms } from './GameSetup.utils'
import styles from './GameSetup.module.css'

/**
 * Shown on Home while no folder has games: that the emulator is ready and a folder of games
 * is what is left, the emulators set up with how many consoles each plays (information, not
 * controls), and the action, focused, that opens the game folders in Settings.
 */
export function GameSetup({ emulators, platforms }: GameSetupProps): React.JSX.Element {
  const { t } = useTranslation('home')
  const openSettings = useOpenSettings()

  return (
    <SetupPanel
      id="game-setup"
      icon={FolderPlus}
      title={t('gameSetup.title')}
      description={t('gameSetup.description')}
      actionLabel={t('gameSetup.setUp')}
      onAction={() => openSettings('gameFolders')}
    >
      <ul className={styles.emulators} aria-label={t('gameSetup.emulators')}>
        {emulators.map((emulator) => (
          <li key={emulator.id} className={styles.emulator}>
            <MonitorCheck className={styles.readyIcon} aria-hidden />
            <div className={styles.details}>
              <p className={styles.name}>
                {emulator.name}
                {emulator.version && <span className={styles.version}> {emulator.version}</span>}
              </p>
              <p className={styles.platforms}>
                {t('gameSetup.linkedConsoles', {
                  count: countLinkedPlatforms(emulator.id, platforms)
                })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SetupPanel>
  )
}
