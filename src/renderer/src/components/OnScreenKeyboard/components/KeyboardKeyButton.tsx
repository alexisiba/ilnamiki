import { ArrowBigUp, Delete } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { KeyboardKeyButtonProps } from '../OnScreenKeyboard.types'
import styles from '../OnScreenKeyboard.module.css'

/** One key: a character, or a special key (shift, delete, space, action) with its own width. */
export function KeyboardKeyButton({
  keyboardKey,
  actionLabel
}: KeyboardKeyButtonProps): React.JSX.Element {
  const { t } = useTranslation()

  switch (keyboardKey.kind) {
    case 'character':
      return (
        <button type="button" className={styles.key}>
          {keyboardKey.value}
        </button>
      )
    case 'backspace':
      return (
        <button type="button" className={styles.key} aria-label={t('keyboard.backspace')}>
          <Delete className={styles.icon} aria-hidden />
        </button>
      )
    case 'shift':
      return (
        <button
          type="button"
          className={`${styles.key} ${styles.shift}`}
          aria-label={t('keyboard.shift')}
        >
          <ArrowBigUp className={styles.icon} aria-hidden />
        </button>
      )
    case 'space':
      return (
        <button type="button" className={`${styles.key} ${styles.space}`}>
          {t('keyboard.space')}
        </button>
      )
    case 'action':
      return (
        <button type="button" className={`${styles.key} ${styles.action}`}>
          {actionLabel}
        </button>
      )
  }
}
