import { InputScope } from '@renderer/core/input'

import { ConfirmDialogContent } from './components/ConfirmDialogContent'
import type { ConfirmDialogProps } from './ConfirmDialog.types'

/**
 * Asks before doing something that can't be undone, over the blurred screen. It is modal: the
 * screen behind gets no input until it closes. Cancel takes focus first, so pressing confirm
 * by accident does nothing.
 */
export function ConfirmDialog(props: ConfirmDialogProps): React.JSX.Element {
  // Its own input scope: while open, the screen behind gets no input.
  return (
    <InputScope>
      <ConfirmDialogContent {...props} />
    </InputScope>
  )
}
