import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { EmulatorChoice, GamePlayer } from '@shared/api'

import { getEmulatorName, isSameEmulator } from '@renderer/utils/emulatorName'

import { emulatorReasonKey, getChoiceName } from '../GameOptions.utils'
import styles from '../GameOptions.module.css'
import { EmulatorRadio } from './EmulatorRadio'

export interface GameEmulatorOptionsProps {
  player: GamePlayer
  choose: (emulator: EmulatorChoice | null) => Promise<void>
}

/**
 * The emulator the game plays with, and why. With several emulators, the choice: Automatic
 * (the usual order: its last session's emulator, then its console's default) or one of them,
 * kept for this game over every other reason. The choice is kept at once; when it can't be,
 * the mark stays and it says so. Focus starts on the choice marked.
 */
export function GameEmulatorOptions({
  player,
  choose
}: GameEmulatorOptionsProps): React.JSX.Element {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)
  const labelId = useId()
  const playsWithId = useId()
  const problemId = useId()
  const { emulators, chosenEmulator, playsWith } = player

  const select = async (emulator: EmulatorChoice | null): Promise<void> => {
    setFailed(false)
    try {
      await choose(emulator)
    } catch {
      setFailed(true)
    }
  }

  const playsWithText = playsWith
    ? t('gameOptions.playsWith', {
        emulator: getChoiceName(playsWith.emulator, emulators),
        reason: t(emulatorReasonKey(playsWith.reason))
      })
    : t('gameOptions.noEmulators')

  return (
    <section className={styles.section} aria-labelledby={labelId}>
      <h3 id={labelId} className={styles.label}>
        {t('gameOptions.emulator')}
      </h3>
      <p id={playsWithId} className={styles.playsWith}>
        {playsWithText}
      </p>
      {emulators.length > 1 && (
        <div
          role="radiogroup"
          aria-labelledby={labelId}
          aria-describedby={failed ? `${playsWithId} ${problemId}` : playsWithId}
          className={styles.options}
        >
          <EmulatorRadio
            focusId="automatic"
            label={t('gameOptions.automatic')}
            hint={t('gameOptions.automaticHint')}
            checked={chosenEmulator === null}
            autoFocus={chosenEmulator === null}
            onSelect={() => void select(null)}
          />
          {emulators.map((emulator) => {
            const { emulatorId, optionId } = emulator
            const key = `${emulatorId}/${optionId ?? ''}`
            const checked = chosenEmulator !== null && isSameEmulator(chosenEmulator, emulator)
            return (
              <EmulatorRadio
                key={key}
                focusId={`emulator-${key}`}
                label={getEmulatorName(emulator)}
                checked={checked}
                autoFocus={checked}
                onSelect={() => void select({ emulatorId, optionId })}
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
