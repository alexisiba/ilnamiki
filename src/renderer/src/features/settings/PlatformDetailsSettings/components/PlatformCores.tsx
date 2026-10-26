import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { setPlatformDefaultCore } from '@renderer/core/ipc'
import { useFocusable } from '@renderer/core/navigation'
import type { InstalledCore, InstalledPlatform } from '@renderer/types/installedPlatform'

import styles from '../PlatformDetailsSettings.module.css'

export interface PlatformCoresProps {
  platform: InstalledPlatform
}

interface CoreOptionProps {
  core: InstalledCore
  checked: boolean
  onSelect: () => void
}

/** One core to pick: a row with a radio mark, filled while it is the one games play with. */
function CoreOption({ core, checked, onSelect }: CoreOptionProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLButtonElement>({ id: `core-${core.emulatorId}-${core.id}` })

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={checked}
      className={styles.coreOption}
      onClick={onSelect}
    >
      <span className={styles.radio} aria-hidden>
        <span className={styles.radioMark} />
      </span>
      <span className={styles.coreName}>{core.name}</span>
    </button>
  )
}

/**
 * The cores that play the platform. With one, its name; with more, one to pick as the one
 * its games play with, the picked one (or the first while none was picked) marked, and a note
 * that it plays the games not played yet, those added later included, while the games already
 * played keep theirs. A pick is kept at once; when it can't be, the mark stays and it says so.
 */
export function PlatformCores({ platform }: PlatformCoresProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [failed, setFailed] = useState(false)
  const labelId = useId()
  const hintId = useId()
  const problemId = useId()
  const [first] = platform.cores
  const selected = platform.defaultCore ?? { emulatorId: first.emulatorId, coreId: first.id }

  const select = async (core: InstalledCore): Promise<void> => {
    setFailed(false)
    try {
      await setPlatformDefaultCore(platform.id, { emulatorId: core.emulatorId, coreId: core.id })
    } catch {
      setFailed(true)
    }
  }

  if (platform.cores.length === 1) {
    return (
      <section className={styles.section} aria-labelledby={labelId}>
        <h3 id={labelId} className={styles.label}>
          {t('platformDetails.core')}
        </h3>
        <p className={styles.core}>{first.name}</p>
      </section>
    )
  }

  return (
    <section className={styles.section} aria-labelledby={labelId}>
      <h3 id={labelId} className={styles.label}>
        {t('platformDetails.defaultCore')}
      </h3>
      <p id={hintId} className={styles.message}>
        {t('platformDetails.defaultCoreHint')}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={failed ? `${hintId} ${problemId}` : hintId}
        className={styles.coreOptions}
      >
        {platform.cores.map((core) => (
          <CoreOption
            key={`${core.emulatorId}/${core.id}`}
            core={core}
            checked={core.emulatorId === selected.emulatorId && core.id === selected.coreId}
            onSelect={() => void select(core)}
          />
        ))}
      </div>
      {failed && (
        <p id={problemId} role="alert" className={styles.problem}>
          {t('platformDetails.defaultCoreFailed')}
        </p>
      )}
    </section>
  )
}
