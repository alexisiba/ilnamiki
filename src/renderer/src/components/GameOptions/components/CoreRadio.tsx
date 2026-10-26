import { useFocusable } from '@renderer/core/navigation'

import styles from '../GameOptions.module.css'

export interface CoreRadioProps {
  /** Unique within the panel. */
  focusId: string
  label: string
  /** Shown below the label, e.g. which core "Automatic" plays with. */
  hint?: string
  checked: boolean
  autoFocus: boolean
  onSelect: () => void
}

/** One choice of core: a row with a radio mark, filled while it is the one chosen. */
export function CoreRadio({
  focusId,
  label,
  hint,
  checked,
  autoFocus,
  onSelect
}: CoreRadioProps): React.JSX.Element {
  const { ref } = useFocusable<HTMLButtonElement>({ id: focusId, autoFocus })

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={checked}
      className={styles.option}
      onClick={onSelect}
    >
      <span className={styles.radio} aria-hidden>
        <span className={styles.radioMark} />
      </span>
      <span className={styles.optionText}>
        <span className={styles.optionLabel}>{label}</span>
        {hint && <span className={styles.optionHint}>{hint}</span>}
      </span>
    </button>
  )
}
