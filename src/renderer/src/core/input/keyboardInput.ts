import { getKeyboardAction, isDirection, type InputAction, type InputDevice } from './input'
import { REPEAT_DELAY_MS, REPEAT_INTERVAL_MS } from './repeat'

/**
 * Listens to the keyboard and calls `emit` with the action of every mapped key press. The
 * system's own key repeat is ignored: a held direction repeats with the same timing as the
 * gamepad, and other keys act once per press. Returns the function that stops listening.
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
