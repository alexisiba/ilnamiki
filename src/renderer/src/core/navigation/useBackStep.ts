import { useEffect, useRef } from 'react'

import { addBackStep } from './backNavigation'

/**
 * While mounted and given `onBack`, back takes this step instead of leaving the screen: for a
 * screen with steps of its own, e.g. returning from a form's second step to its first. It
 * still means "one level back"; never use it to give back another meaning.
 */
export function useBackStep(onBack: (() => void) | undefined): void {
  const handler = useRef(onBack)
  const hasStep = onBack !== undefined

  useEffect(() => {
    handler.current = onBack
  })

  useEffect(() => {
    if (!hasStep) return
    return addBackStep({ run: () => handler.current?.() })
  }, [hasStep])
}
