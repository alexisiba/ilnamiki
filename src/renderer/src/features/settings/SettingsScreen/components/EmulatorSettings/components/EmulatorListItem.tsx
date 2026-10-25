import { Gamepad2 } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import type { EmulatorListItemProps } from '../EmulatorSettings.types'
import styles from '../EmulatorSettings.module.css'

/**
 * An emulator: its icon, or a generic one without it, then its name and its version (left out
 * when the emulator doesn't report one). Confirming it opens its details.
 */
export function EmulatorListItem({ emulator, onOpen }: EmulatorListItemProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const { ref } = useFocusable<HTMLButtonElement>({ id: emulator.id })
  const nameId = useId()
  const versionId = useId()

  return (
    <button
      ref={ref}
      type="button"
      className={styles.item}
      aria-labelledby={nameId}
      aria-describedby={emulator.version ? versionId : undefined}
      onClick={onOpen}
    >
      <span className={styles.icon}>
        {emulator.iconDataUrl ? (
          <img className={styles.iconImage} src={emulator.iconDataUrl} alt="" />
        ) : (
          <Gamepad2 className={styles.iconGlyph} aria-hidden />
        )}
      </span>
      <span className={styles.info}>
        <span id={nameId} className={styles.name}>
          {emulator.name}
        </span>
        {emulator.version && (
          <span id={versionId} className={styles.version}>
            {t('emulators.version', { version: emulator.version })}
          </span>
        )}
      </span>
    </button>
  )
}
