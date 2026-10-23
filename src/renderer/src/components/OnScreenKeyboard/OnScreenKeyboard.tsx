import { useTranslation } from 'react-i18next'

import { KeyboardKeyButton } from './components/KeyboardKeyButton'
import { KEYBOARD_KEYS } from './OnScreenKeyboard.constants'
import type { OnScreenKeyboardProps } from './OnScreenKeyboard.types'
import styles from './OnScreenKeyboard.module.css'

/** A QWERTY keyboard on screen, so text can be typed with a gamepad alone. */
export function OnScreenKeyboard({ actionLabel }: OnScreenKeyboardProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div role="group" className={styles.keyboard} aria-label={t('keyboard.label')}>
      {KEYBOARD_KEYS.map((keyboardKey, index) => (
        <KeyboardKeyButton key={index} keyboardKey={keyboardKey} actionLabel={actionLabel} />
      ))}
    </div>
  )
}
