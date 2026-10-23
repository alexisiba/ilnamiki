import { getKeyboardAction, isDirection, type InputAction, type InputDevice } from './input'
import { REPEAT_DELAY_MS, REPEAT_INTERVAL_MS } from './repeat'

/** Keys that still act while typing in a text field; every other key edits the text. */
const TEXT_FIELD_ACTION_KEYS = new Set(['Escape', 'Enter', 'ArrowUp', 'ArrowDown'])

const isTextField = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.matches('input, textarea, [contenteditable]')

/**
 * Listens to the keyboard and calls `emit` with the action of every mapped key press. The
 * system's own key repeat is ignored: a held direction repeats with the same timing as the
 * gamepad, and other keys act once per press. While typing in a text field only a few keys act
 * (e.g. Escape), so letters and space type. Returns the function that stops listening.
 */
export function startKeyboardInput(
  emit: (action: InputAction, device: InputDevice) => void
): () => void {
  let heldKey: string | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  const stopRepeating = (): void => {
    clearTimeout(timer)
    timer = undefined
    heldKey = undefined
  }

  const repeatAfter = (delay: number, action: InputAction): void => {
    timer = setTimeout(() => {
      emit(action, 'keyboard')
      repeatAfter(REPEAT_INTERVAL_MS, action)
    }, delay)
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (isTextField(event.target) && !TEXT_FIELD_ACTION_KEYS.has(event.key)) return
    const action = getKeyboardAction(event.key)
    if (!action) return

    event.preventDefault()
    if (event.repeat) return

    emit(action, 'keyboard')
    if (isDirection(action)) {
      stopRepeating()
      heldKey = event.key
      repeatAfter(REPEAT_DELAY_MS, action)
    }
  }

  const handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key === heldKey) stopRepeating()
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  // A key released while the window has no focus never reports its keyup.
  window.addEventListener('blur', stopRepeating)

  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', stopRepeating)
    stopRepeating()
  }
}
