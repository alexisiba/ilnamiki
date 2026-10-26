import { Check } from 'lucide-react'

import { useFocusable } from '@renderer/core/navigation'

import type { PlatformSelectOptionProps } from '../PlatformSelect.types'
import styles from '../PlatformSelect.module.css'

/** A platform in the list; the chosen one is marked with a check and as current. */
export function PlatformSelectOption({
  platform,
  selected,
  autoFocus,
  onSelect
}: PlatformSelectOptionProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLButtonElement>({ id: platform.id, autoFocus })

  return (
    <button
      ref={ref}
      type="button"
      className={styles.option}
      aria-current={selected || undefined}
      onClick={onSelect}
    >
      <span className={styles.optionName}>{platform.name}</span>
      {selected && <Check className={styles.check} aria-hidden />}
    </button>
  )
}
