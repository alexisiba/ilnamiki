import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { playUiSound } from '@renderer/core/audio'
import { useInputAction, type InputAction } from '@renderer/core/input'
import { FocusGroup } from '@renderer/core/navigation'

import { KeyboardKeyButton } from './components/KeyboardKeyButton'
import {
  ACTION_KEY,
  BACKSPACE_KEY,
  KEY_SHORTCUTS,
  KEYBOARD_KEYS
} from './OnScreenKeyboard.constants'
import { usePhysicalKeyboard } from './OnScreenKeyboard.hooks'
import type { KeyboardKey, OnScreenKeyboardProps } from './OnScreenKeyboard.types'
import { keyId, typeKey } from './OnScreenKeyboard.utils'
import styles from './OnScreenKeyboard.module.css'

/**
 * A QWERTY keyboard on screen, so text can be typed with a gamepad alone. Directions move
 * between keys and confirm presses the focused one; some keys also have their own button
 * wherever focus is. A physical keyboard types too. A key shows pressed while its button or
 * physical key is down, and only Delete repeats while held by a button.
 */
export function OnScreenKeyboard({
  value,
  onChange,
  onSubmit,
  actionLabel
}: OnScreenKeyboardProps): React.JSX.Element {
  const { t } = useTranslation()
  const [capsLock, setCapsLock] = useState(false)
  const [focusedKey, setFocusedKey] = useState<string>()
  /** The key shown pressed, and the action whose button holds it down. */
  const [held, setHeld] = useState<{ key: string; action: InputAction }>()

  const keysRef = useRef<HTMLDivElement>(null)

  // Physical keys light their key while held and type wherever focus is: in the field by
  // themselves, on the keys here. Caps Lock follows the physical one.
  const heldPhysicalKeys = usePhysicalKeyboard((event) => {
    if (event.key === 'CapsLock') {
      if (!event.repeat) setCapsLock((on) => !on)
      return
    }
    if (!(event.target instanceof Node) || !keysRef.current?.contains(event.target)) return
    if (event.key === 'Backspace') onChange(typeKey(value, BACKSPACE_KEY, capsLock))
    else if (event.key.length === 1) onChange(value + event.key)
    else return
    // Space would also click the focused key.
    event.preventDefault()
  })

  const pressKey = (keyboardKey: KeyboardKey, heldBy?: InputAction): void => {
    playUiSound('key-press')
    if (heldBy) setHeld({ key: keyId(keyboardKey), action: heldBy })
    if (keyboardKey.kind === 'capsLock') setCapsLock(!capsLock)
    else if (keyboardKey.kind === 'action') onSubmit()
    else onChange(typeKey(value, keyboardKey, capsLock))
  }

  // Shortcut buttons press their key wherever focus is; confirming in a text field (Enter)
  // submits too.
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
      const shortcut = KEY_SHORTCUTS.find((candidate) => candidate.action === action)
      if (shortcut) pressKey(shortcut.key, action)
      if (action === 'confirm' && document.activeElement instanceof HTMLInputElement) {
        pressKey(ACTION_KEY, action)
      }
    },
    { repeat: true, release: true }
  )

  return (
    <FocusGroup id="on-screen-keyboard">
      {/* data-typing: character keys type here instead of acting (see core/input). */}
      <div
        ref={keysRef}
        role="group"
        className={styles.keyboard}
        aria-label={t('keyboard.label')}
        data-typing
      >
        {KEYBOARD_KEYS.map((keyboardKey) => {
          const id = keyId(keyboardKey)
          return (
            <KeyboardKeyButton
              key={id}
              keyboardKey={keyboardKey}
              actionLabel={actionLabel}
              capsLock={capsLock}
              pressed={held?.key === id || heldPhysicalKeys.includes(id)}
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
