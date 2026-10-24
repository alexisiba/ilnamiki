import type { Direction, InputAction, InputDevice } from './input'

/**
 * How a button is drawn for a given device. Labels are shown as-is; `labelKey` and
 * `accessibleLabelKey` are i18n keys in the `common` namespace.
 */
export type ButtonGlyph =
  | { shape: 'face'; label: string; accessibleLabelKey?: string }
  | { shape: 'shoulder'; label: string }
  /** Without `direction`, the whole d-pad (every direction). */
  | { shape: 'dpad'; direction?: Direction }
  | ({ shape: 'key'; accessibleLabelKey?: string } & ({ label: string } | { labelKey: string }))

const DPAD_GLYPHS: Record<Direction, ButtonGlyph> = {
  up: { shape: 'dpad', direction: 'up' },
  down: { shape: 'dpad', direction: 'down' },
  left: { shape: 'dpad', direction: 'left' },
  right: { shape: 'dpad', direction: 'right' }
}

/** What a hint can show: an input action, or `navigate` for all the directions together. */
export type HintAction = InputAction | 'navigate'

const BUTTON_GLYPHS: Record<InputDevice, Record<HintAction, ButtonGlyph>> = {
  xbox: {
    ...DPAD_GLYPHS,
    navigate: { shape: 'dpad' },
    confirm: { shape: 'face', label: 'A' },
    back: { shape: 'face', label: 'B' },
    secondary: { shape: 'face', label: 'X' },
    tertiary: { shape: 'face', label: 'Y' },
    menu: { shape: 'face', label: '☰', accessibleLabelKey: 'glyphs.menu' },
    prevSection: { shape: 'shoulder', label: 'LB' },
    nextSection: { shape: 'shoulder', label: 'RB' },
    prevGroup: { shape: 'shoulder', label: 'LT' },
    nextGroup: { shape: 'shoulder', label: 'RT' }
  },
  playstation: {
    ...DPAD_GLYPHS,
    navigate: { shape: 'dpad' },
    confirm: { shape: 'face', label: '✕', accessibleLabelKey: 'glyphs.cross' },
    back: { shape: 'face', label: '○', accessibleLabelKey: 'glyphs.circle' },
    secondary: { shape: 'face', label: '□', accessibleLabelKey: 'glyphs.square' },
    tertiary: { shape: 'face', label: '△', accessibleLabelKey: 'glyphs.triangle' },
    menu: { shape: 'face', label: '☰', accessibleLabelKey: 'glyphs.options' },
    prevSection: { shape: 'shoulder', label: 'L1' },
    nextSection: { shape: 'shoulder', label: 'R1' },
    prevGroup: { shape: 'shoulder', label: 'L2' },
    nextGroup: { shape: 'shoulder', label: 'R2' }
  },
  keyboard: {
    up: { shape: 'key', label: '↑', accessibleLabelKey: 'keys.arrowUp' },
    down: { shape: 'key', label: '↓', accessibleLabelKey: 'keys.arrowDown' },
    left: { shape: 'key', label: '←', accessibleLabelKey: 'keys.arrowLeft' },
    right: { shape: 'key', label: '→', accessibleLabelKey: 'keys.arrowRight' },
    navigate: { shape: 'key', label: '↑↓←→', accessibleLabelKey: 'keys.arrows' },
    confirm: { shape: 'key', labelKey: 'keys.enter' },
    back: { shape: 'key', labelKey: 'keys.escape' },
    secondary: { shape: 'key', label: 'X' },
    tertiary: { shape: 'key', label: 'Y' },
    menu: { shape: 'key', label: 'M' },
    prevSection: { shape: 'key', label: 'Q' },
    nextSection: { shape: 'key', label: 'E' },
    prevGroup: { shape: 'key', labelKey: 'keys.pageUp' },
    nextGroup: { shape: 'key', labelKey: 'keys.pageDown' }
  }
}

export function getButtonGlyph(action: HintAction, device: InputDevice): ButtonGlyph {
  return BUTTON_GLYPHS[device][action]
}
