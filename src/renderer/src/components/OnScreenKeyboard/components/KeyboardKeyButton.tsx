import { ArrowBigUp, Delete } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useFocusable } from '@renderer/core/navigation'

import type { KeyboardKeyButtonProps } from '../OnScreenKeyboard.types'
import { keyCharacter, keyId } from '../OnScreenKeyboard.utils'
import styles from '../OnScreenKeyboard.module.css'

/** Classes by key kind: special keys span several columns. */
const KIND_CLASSES: Partial<Record<KeyboardKeyButtonProps['keyboardKey']['kind'], string>> = {
  shift: styles.shift,
  space: styles.space,
  action: styles.action
}

/**
 * One key, focusable by direction or pointer. It shows pressed while held down, whether by a
 * button (`pressed`) or the pointer (`:active`); the Shift key stays lit (without the focus
 * glow) while Shift is on.
 */
export function KeyboardKeyButton({
  keyboardKey,
  actionLabel,
  shifted,
  pressed,
  onPress,
  onFocus,
  onBlur
}: KeyboardKeyButtonProps): React.JSX.Element {
  const { t } = useTranslation()
  const { ref } = useFocusable<HTMLButtonElement>({ id: keyId(keyboardKey) })
  const isShift = keyboardKey.kind === 'shift'

  const className = [
    styles.key,
    KIND_CLASSES[keyboardKey.kind],
    isShift && shifted && styles.active,
    pressed && styles.pressed
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      aria-pressed={isShift ? shifted : undefined}
      aria-label={
        keyboardKey.kind === 'backspace' || isShift ? t(`keyboard.${keyboardKey.kind}`) : undefined
      }
      // Confirm clicks the focused key without a pointer (detail 0).
      onClick={(event) => onPress(event.detail === 0)}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <KeyLabel keyboardKey={keyboardKey} actionLabel={actionLabel} shifted={shifted} />
    </button>
  )
}

/** What a key shows: its character, an icon or a word. */
function KeyLabel({
  keyboardKey,
  actionLabel,
  shifted
}: Pick<KeyboardKeyButtonProps, 'keyboardKey' | 'actionLabel' | 'shifted'>): React.ReactNode {
  const { t } = useTranslation()

  switch (keyboardKey.kind) {
    case 'character':
      return keyCharacter(keyboardKey.value, shifted)
    case 'backspace':
      return <Delete className={styles.icon} aria-hidden />
    case 'shift':
      return <ArrowBigUp className={styles.icon} aria-hidden />
    case 'space':
      return t('keyboard.space')
    case 'action':
      return actionLabel
  }
}
