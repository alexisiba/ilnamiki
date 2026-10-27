import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { setPlatformDefaultEmulator } from '@renderer/core/ipc'
import { useFocusable } from '@renderer/core/navigation'
import type { InstalledPlatform, PlatformEmulator } from '@renderer/types/installedPlatform'
import { getEmulatorName, isSameEmulator } from '@renderer/utils/emulatorName'

import styles from '../PlatformDetailsSettings.module.css'

export interface PlatformEmulatorsProps {
  platform: InstalledPlatform
}

interface EmulatorOptionProps {
  emulator: PlatformEmulator
  checked: boolean
  onSelect: () => void
}

/** One emulator to pick: a row with a radio mark, filled while it is the one games play with. */
function EmulatorOption({ emulator, checked, onSelect }: EmulatorOptionProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLButtonElement>({
    id: `emulator-${emulator.emulatorId}-${emulator.optionId ?? ''}`
  })

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={checked}
      className={styles.emulatorOption}
      onClick={onSelect}
    >
      <span className={styles.radio} aria-hidden>
        <span className={styles.radioMark} />
      </span>
      <span className={styles.emulatorName}>{getEmulatorName(emulator)}</span>
    </button>
  )
}

/**
 * The emulators that play the platform. With one, its name; with more, one to pick as the one
 * its games play with, the picked one (or the first while none was picked) marked, and a note
 * that it plays the games not played yet, those added later included, while the games already
 * played keep theirs. A pick is kept at once; when it can't be, the mark stays and it says so.
 */
export function PlatformEmulators({ platform }: PlatformEmulatorsProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [failed, setFailed] = useState(false)
  const labelId = useId()
  const hintId = useId()
  const problemId = useId()
  const [first] = platform.emulators
  const selected = platform.defaultEmulator ?? first

  const select = async ({ emulatorId, optionId }: PlatformEmulator): Promise<void> => {
    setFailed(false)
    try {
      await setPlatformDefaultEmulator(platform.id, { emulatorId, optionId })
    } catch {
      setFailed(true)
    }
  }

  if (platform.emulators.length === 1) {
    return (
      <section className={styles.section} aria-labelledby={labelId}>
        <h3 id={labelId} className={styles.label}>
          {t('platformDetails.emulator')}
        </h3>
        <p className={styles.emulator}>{getEmulatorName(first)}</p>
      </section>
    )
  }

  return (
    <section className={styles.section} aria-labelledby={labelId}>
      <h3 id={labelId} className={styles.label}>
        {t('platformDetails.defaultEmulator')}
      </h3>
      <p id={hintId} className={styles.message}>
        {t('platformDetails.defaultEmulatorHint')}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={failed ? `${hintId} ${problemId}` : hintId}
        className={styles.emulatorOptions}
      >
        {platform.emulators.map((emulator) => (
          <EmulatorOption
            key={`${emulator.emulatorId}/${emulator.optionId ?? ''}`}
            emulator={emulator}
            checked={isSameEmulator(selected, emulator)}
            onSelect={() => void select(emulator)}
          />
        ))}
      </div>
      {failed && (
        <p id={problemId} role="alert" className={styles.problem}>
          {t('platformDetails.defaultEmulatorFailed')}
        </p>
      )}
    </section>
  )
}
