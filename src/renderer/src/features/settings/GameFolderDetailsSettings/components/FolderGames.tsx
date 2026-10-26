import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { useFolderGames } from '@renderer/core/ipc'

import type { FolderGamesProps } from '../GameFolderDetailsSettings.types'
import styles from '../GameFolderDetailsSettings.module.css'
import { FolderGameItem } from './FolderGameItem'

/**
 * The games saved from the folder, by title, read when it shows (so they are fresh after
 * the folder is scanned again). Says so when there are none or they can't be read; shows
 * nothing until they are read, so neither message flashes.
 */
export function FolderGames({ folderId }: FolderGamesProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { status, games } = useFolderGames(folderId)
  const labelId = useId()

  return (
    <section className={styles.games} aria-labelledby={labelId}>
      <h3 id={labelId} className={styles.label}>
        {t('gameFolderDetails.games')}
      </h3>
      {games.length > 0 && (
        <ul className={styles.list}>
          {games.map((game) => (
            <li key={game.id}>
              <FolderGameItem game={game} />
            </li>
          ))}
        </ul>
      )}
      {status === 'ready' && games.length === 0 && (
        <p className={styles.message}>{t('gameFolderDetails.noGames')}</p>
      )}
      {status === 'failed' && (
        <p className={styles.message}>{t('gameFolderDetails.gamesFailed')}</p>
      )}
    </section>
  )
}
