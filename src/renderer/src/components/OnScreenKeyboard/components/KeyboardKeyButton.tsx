import { ArrowBigUpDash, Delete } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ButtonHint } from '@renderer/components/ButtonHint'
import { useActiveInputDevice, type InputAction } from '@renderer/core/input'
import { useFocusable } from '@renderer/core/navigation'

import { KEY_SHORTCUTS } from '../OnScreenKeyboard.constants'
import type { KeyboardKeyButtonProps } from '../OnScreenKeyboard.types'
import { keyCharacter, keyId } from '../OnScreenKeyboard.utils'
import styles from '../OnScreenKeyboard.module.css'

/** Classes by key kind: special keys span several columns. */
const KIND_CLASSES: Partial<Record<KeyboardKeyButtonProps['keyboardKey']['kind'], string>> = {
  backspace: styles.backspace,
  capsLock: styles.capsLock,
  space: styles.space,
  action: styles.action
}

/**
 * One key, focusable by direction or pointer. It shows pressed while held down, whether by a
 * button (`pressed`) or the pointer (`:active`); the Caps Lock key stays lit (without the
 * focus glow) while Caps Lock is on.
 */
export function KeyboardKeyButton({
  keyboardKey,
  actionLabel,
  capsLock,
  pressed,
  onPress,
  onFocus,
  onBlur
}: KeyboardKeyButtonProps): React.JSX.Element {
  const { t } = useTranslation()
  const { ref } = useFocusable<HTMLButtonElement>({ id: keyId(keyboardKey) })
  const isCapsLock = keyboardKey.kind === 'capsLock'
  const shortcut = KEY_SHORTCUTS.find(({ key }) => key.kind === keyboardKey.kind)

  const className = [
    styles.key,
    KIND_CLASSES[keyboardKey.kind],
    isCapsLock && capsLock && styles.active,
    pressed && styles.pressed
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      aria-pressed={isCapsLock ? capsLock : undefined}
      aria-label={
        keyboardKey.kind === 'backspace' || isCapsLock
          ? t(`keyboard.${keyboardKey.kind}`)
          : undefined
      }
      // Confirm clicks the focused key without a pointer (detail 0).
      onClick={(event) => onPress(event.detail === 0)}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <KeyLabel keyboardKey={keyboardKey} actionLabel={actionLabel} capsLock={capsLock} />
      {shortcut && <KeyShortcut action={shortcut.action} />}
    </button>
  )
}

/**
 * The gamepad button that also presses the key, in its corner. Hidden for the keyboard, where
 * text is typed straight into the field, and from assistive technology, since it only
 * teaches a gamepad shortcut.
 */
function KeyShortcut({ action }: { action: InputAction }): React.ReactNode {
  if (useActiveInputDevice() === 'keyboard') return null

  return (
    <span className={styles.shortcut} aria-hidden="true">
      <ButtonHint action={action} />
    </span>
  )
}

/** What a key shows: its character, an icon or a word. */
function KeyLabel({
  keyboardKey,
  actionLabel,
  capsLock
}: Pick<KeyboardKeyButtonProps, 'keyboardKey' | 'actionLabel' | 'capsLock'>): React.ReactNode {
  const { t } = useTranslation()

  switch (keyboardKey.kind) {
    case 'character':
      return keyCharacter(keyboardKey.value, capsLock)
    case 'backspace':
      return <Delete className={styles.icon} aria-hidden />
    case 'capsLock':
      return <ArrowBigUpDash className={styles.icon} aria-hidden />
    case 'space':
      return t('keyboard.space')
    case 'action':
      return actionLabel
  }
}
