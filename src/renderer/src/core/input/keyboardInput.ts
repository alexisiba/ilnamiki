import {
  getKeyboardAction,
  isDirection,
  type InputAction,
  type InputDevice,
  type InputPhase
} from './input'
import { REPEAT_DELAY_MS, REPEAT_INTERVAL_MS } from './repeat'

/** Keys that still act while typing in a text field; every other key edits the text. */
const TEXT_FIELD_ACTION_KEYS = new Set(['Escape', 'Enter', 'ArrowUp', 'ArrowDown'])

const isTextField = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.matches('input, textarea, [contenteditable]')

/**
 * Whether the key types a character inside an element marked `data-typing` (e.g. the
 * on-screen keyboard), which types it itself; other keys there act as usual.
 */
const isTypedCharacter = (event: KeyboardEvent): boolean =>
  event.key.length === 1 &&
  event.target instanceof HTMLElement &&
  event.target.closest('[data-typing]') !== null

/** The same key whatever the case, so a key pressed with Shift and released without matches. */
const normalizeKey = (key: string): string => (key.length === 1 ? key.toLowerCase() : key)

/**
 * Listens to the keyboard and calls `emit` with the action of every mapped key press. The
 * system's own key repeat is ignored: the latest held key repeats with the same timing as the
 * gamepad, and keys other than directions report their release. While typing in a text field
 * only a few keys act (e.g. Escape), so letters and space type; inside a `data-typing` element
 * only character keys are left to type. Returns the function that stops listening.
 */
export function startKeyboardInput(
  emit: (action: InputAction, device: InputDevice, phase?: InputPhase) => void
): () => void {
  let heldKey: string | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  /** Keys down that report their release, with their action. */
  const pressedKeys = new Map<string, InputAction>()

  const stopRepeating = (): void => {
    clearTimeout(timer)
    timer = undefined
    heldKey = undefined
  }

  const repeatAfter = (delay: number, action: InputAction): void => {
    timer = setTimeout(() => {
      emit(action, 'keyboard', 'repeat')
      repeatAfter(REPEAT_INTERVAL_MS, action)
    }, delay)
  }

  const release = (key: string): void => {
    const action = pressedKeys.get(key)
    if (!action) return
    pressedKeys.delete(key)
    emit(action, 'keyboard', 'release')
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (isTextField(event.target) && !TEXT_FIELD_ACTION_KEYS.has(event.key)) return
    if (isTypedCharacter(event)) return
    const action = getKeyboardAction(event.key)
    if (!action) return

    event.preventDefault()
    if (event.repeat) return

    const key = normalizeKey(event.key)
    emit(action, 'keyboard')
    if (!isDirection(action)) pressedKeys.set(key, action)
    stopRepeating()
    heldKey = key
    repeatAfter(REPEAT_DELAY_MS, action)
  }

  const handleKeyUp = (event: KeyboardEvent): void => {
    const key = normalizeKey(event.key)
    if (key === heldKey) stopRepeating()
    release(key)
  }

  // A key released while the window has no focus never reports its keyup.
  const handleBlur = (): void => {
    stopRepeating()
    for (const key of [...pressedKeys.keys()]) release(key)
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('blur', handleBlur)

  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', handleBlur)
    stopRepeating()
  }
}
