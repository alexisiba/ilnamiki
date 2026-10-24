import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useInputAction, type InputAction } from '@renderer/core/input'
import { FocusGroup } from '@renderer/core/navigation'

import { KeyboardKeyButton } from './components/KeyboardKeyButton'
import { ACTION_KEY, BACKSPACE_KEY, KEYBOARD_KEYS, SHIFT_KEY } from './OnScreenKeyboard.constants'
import type { KeyboardKey, OnScreenKeyboardProps } from './OnScreenKeyboard.types'
import { keyId, typeKey } from './OnScreenKeyboard.utils'
import styles from './OnScreenKeyboard.module.css'

/**
 * A QWERTY keyboard on screen, so text can be typed with a gamepad alone. Directions move
 * between keys and confirm presses the focused one; some keys also have their own button
 * wherever focus is. A key shows pressed while its button is down, and only Delete repeats
 * while held.
 */
export function OnScreenKeyboard({
  value,
  onChange,
  onSubmit,
  actionLabel
}: OnScreenKeyboardProps): React.JSX.Element {
  const { t } = useTranslation()
  const [shifted, setShifted] = useState(false)
  const [focusedKey, setFocusedKey] = useState<string>()
  /** The key shown pressed, and the action whose button holds it down. */
  const [held, setHeld] = useState<{ key: string; action: InputAction }>()

  const pressKey = (keyboardKey: KeyboardKey, heldBy?: InputAction): void => {
    if (heldBy) setHeld({ key: keyId(keyboardKey), action: heldBy })
    if (keyboardKey.kind === 'shift') setShifted(!shifted)
    else if (keyboardKey.kind === 'action') onSubmit()
    else onChange(typeKey(value, keyboardKey, shifted))
  }

  // LB and Start stand in for Shift and the action key while the keyboard is open (an
  // exception to their fixed meaning, see the ilnamiki-ui skill). Confirming in a text field
  // (Enter) submits too.
  useInputAction(
    (action, phase) => {
      if (phase === 'release') {
        setHeld((current) => (current?.action === action ? undefined : current))
        return
      }
      if (phase === 'repeat') {
        // Confirm's first press reaches the focused key through navigation.
        const deleting =
          action === 'secondary' || (action === 'confirm' && focusedKey === 'backspace')
        if (deleting) pressKey(BACKSPACE_KEY)
        return
      }
      if (action === 'secondary') pressKey(BACKSPACE_KEY, action)
      if (action === 'prevSection') pressKey(SHIFT_KEY, action)
      const confirmInField =
        action === 'confirm' && document.activeElement instanceof HTMLInputElement
      if (action === 'menu' || confirmInField) pressKey(ACTION_KEY, action)
    },
    { repeat: true, release: true }
  )

  return (
    <FocusGroup id="on-screen-keyboard">
      <div role="group" className={styles.keyboard} aria-label={t('keyboard.label')}>
        {KEYBOARD_KEYS.map((keyboardKey) => {
          const id = keyId(keyboardKey)
          return (
            <KeyboardKeyButton
              key={id}
              keyboardKey={keyboardKey}
              actionLabel={actionLabel}
              shifted={shifted}
              pressed={held?.key === id}
              onPress={(byConfirm) => pressKey(keyboardKey, byConfirm ? 'confirm' : undefined)}
              onFocus={() => setFocusedKey(id)}
              onBlur={() => setFocusedKey(undefined)}
            />
          )
        })}
      </div>
    </FocusGroup>
  )
}
