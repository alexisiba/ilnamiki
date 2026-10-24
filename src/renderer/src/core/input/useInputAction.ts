import { useContext, useEffect, useEffectEvent } from 'react'

import { isDirection, type InputAction, type InputPhase } from './input'
import { subscribeToInput } from './inputBus'
import { InputScopeContext, isActiveScope } from './inputScope'

export interface UseInputActionOptions {
  /**
   * Also receive the repeats of held buttons other than directions, e.g. to keep deleting
   * while Delete is held. Held directions always repeat; other buttons act once by default.
   */
  repeat?: boolean
  /** Also receive button releases, e.g. to show a key pressed only while its button is down. */
  release?: boolean
}

/**
 * Calls `onAction` with the semantic action of every mapped input while mounted, as long as
 * its input scope is the active one (see `InputScope`). `phase` tells presses from the repeats
 * and releases asked for in the options.
 */
export function useInputAction(
  onAction: (action: InputAction, phase: InputPhase) => void,
  { repeat = false, release = false }: UseInputActionOptions = {}
): void {
  const handleAction = useEffectEvent(onAction)
  const scope = useContext(InputScopeContext)

  useEffect(
    () =>
      subscribeToInput((action, _device, phase) => {
        if (!isActiveScope(scope)) return
        if (phase === 'repeat' && !repeat && !isDirection(action)) return
        if (phase === 'release' && !release) return
        handleAction(action, phase)
      }),
    [scope, repeat, release]
  )
}
