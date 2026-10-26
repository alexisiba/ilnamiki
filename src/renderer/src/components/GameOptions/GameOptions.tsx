import { InputScope } from '@renderer/core/input'

import { GameOptionsPanel } from './components/GameOptionsPanel'
import type { GameOptionsProps } from './GameOptions.types'

/**
 * What can be set for a game, in a panel that slides in from the right over the dimmed
 * screen: for now, the core it plays with. It is modal: the screen behind gets no input until
 * it closes, with Back, Close or a click outside it.
 */
export function GameOptions(props: GameOptionsProps): React.JSX.Element {
  // Its own input scope: while open, the screen behind gets no input.
  return (
    <InputScope>
      <GameOptionsPanel {...props} />
    </InputScope>
  )
}
