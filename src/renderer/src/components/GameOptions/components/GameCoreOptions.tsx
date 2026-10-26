import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CoreRef, GamePlayer } from '@shared/api'

import { coreReasonKey, getCoreName, isSameCore } from '../GameOptions.utils'
import styles from '../GameOptions.module.css'
import { CoreRadio } from './CoreRadio'

export interface GameCoreOptionsProps {
  player: GamePlayer
  choose: (core: CoreRef | null) => Promise<void>
}

/**
 * The core the game plays with, and why. With several cores, the choice: Automatic (the
 * usual order: its last session's core, then its console's default) or one of them, kept for
 * this game over every other reason. The choice is kept at once; when it can't be, the mark
 * stays and it says so. Focus starts on the choice marked.
 */
export function GameCoreOptions({ player, choose }: GameCoreOptionsProps): React.JSX.Element {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)
  const labelId = useId()
  const playsWithId = useId()
  const problemId = useId()
  const { cores, chosenCore, playsWith } = player

  const select = async (core: CoreRef | null): Promise<void> => {
    setFailed(false)
    try {
      await choose(core)
    } catch {
      setFailed(true)
    }
  }

  const playsWithText = playsWith
    ? t('gameOptions.playsWith', {
        core: getCoreName(playsWith.core, cores),
        reason: t(coreReasonKey(playsWith.reason))
      })
    : t('gameOptions.noCores')

  return (
    <section className={styles.section} aria-labelledby={labelId}>
      <h3 id={labelId} className={styles.label}>
        {t('gameOptions.core')}
      </h3>
      <p id={playsWithId} className={styles.playsWith}>
        {playsWithText}
      </p>
      {cores.length > 1 && (
        <div
          role="radiogroup"
          aria-labelledby={labelId}
          aria-describedby={failed ? `${playsWithId} ${problemId}` : playsWithId}
          className={styles.options}
        >
          <CoreRadio
            focusId="automatic"
            label={t('gameOptions.automatic')}
            hint={t('gameOptions.automaticHint')}
            checked={chosenCore === null}
            autoFocus={chosenCore === null}
            onSelect={() => void select(null)}
          />
          {cores.map((core) => {
            const checked = chosenCore !== null && isSameCore(chosenCore, core)
            return (
              <CoreRadio
                key={`${core.emulatorId}/${core.id}`}
                focusId={`core-${core.emulatorId}-${core.id}`}
                label={core.name}
                checked={checked}
                autoFocus={checked}
                onSelect={() => void select({ emulatorId: core.emulatorId, coreId: core.id })}
              />
            )
          })}
        </div>
      )}
      {failed && (
        <p id={problemId} role="alert" className={styles.problem}>
          {t('gameOptions.saveFailed')}
        </p>
      )}
    </section>
  )
}
