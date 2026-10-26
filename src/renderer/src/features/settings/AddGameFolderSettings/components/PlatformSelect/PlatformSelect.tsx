import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InputScope } from '@renderer/core/input'
import { useFocusable } from '@renderer/core/navigation'

import { PlatformSelectDialog } from './components/PlatformSelectDialog'
import type { PlatformSelectProps } from './PlatformSelect.types'
import styles from './PlatformSelect.module.css'

/**
 * Chooses one of the installed platforms: a button showing the chosen one (or a prompt), that
 * opens the list of platforms over the screen. The list is the app's own, not the system's,
 * so it works the same with a gamepad, keyboard and mouse.
 */
export function PlatformSelect({
  labelId,
  controlId,
  descriptionId,
  platforms,
  value,
  onChange
}: PlatformSelectProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [open, setOpen] = useState(false)
  const { ref } = useFocusable<HTMLButtonElement>({ id: 'platform' })
  const valueId = useId()
  const selected = platforms.find((platform) => platform.id === value)

  const select = (platformId: string): void => {
    onChange(platformId)
    setOpen(false)
  }

  return (
    <>
      <button
        ref={ref}
        id={controlId}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${valueId}`}
        aria-describedby={descriptionId}
        onClick={() => setOpen(true)}
      >
        <span id={valueId} className={selected ? styles.value : styles.placeholder}>
          {selected ? selected.name : t('addGameFolder.selectPlatform')}
        </span>
        <ChevronDown className={styles.chevron} aria-hidden />
      </button>
      {open && (
        // Its own input scope: while open, the form behind gets no input.
        <InputScope>
          <PlatformSelectDialog
            platforms={platforms}
            value={value}
            onSelect={select}
            onClose={() => setOpen(false)}
          />
        </InputScope>
      )}
    </>
  )
}
