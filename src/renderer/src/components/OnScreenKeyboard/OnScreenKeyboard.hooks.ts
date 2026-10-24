import { useEffect, useState } from 'react'

import { keyId, matchPhysicalKey } from './OnScreenKeyboard.utils'

/**
 * Follows the physical keyboard while the on-screen one is shown: calls `onKeyDown` on every
 * key press (shortcuts with Ctrl, Alt or Meta aside) and returns the ids of the on-screen keys
 * whose physical key is held down. A key is released by its position (`code`), since Shift
 * can change its character between press and release.
 */
export function usePhysicalKeyboard(onKeyDown: (event: KeyboardEvent) => void): string[] {
  /** On-screen key ids by the position of the physical key holding them down. */
  const [held, setHeld] = useState<Record<string, string>>({})

  useEffect(() => {
    const position = (event: KeyboardEvent): string => event.code || event.key

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.ctrlKey || event.altKey || event.metaKey) return
      onKeyDown(event)
      const keyboardKey = matchPhysicalKey(event.key)
      if (keyboardKey) setHeld((current) => ({ ...current, [position(event)]: keyId(keyboardKey) }))
    }

    const handleKeyUp = (event: KeyboardEvent): void => {
      setHeld((current) => {
        if (!(position(event) in current)) return current
        const rest = { ...current }
        delete rest[position(event)]
        return rest
      })
    }

    // A key released while the window has no focus never reports its keyup.
    const handleBlur = (): void => setHeld({})

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [onKeyDown])

  return Object.values(held)
}
