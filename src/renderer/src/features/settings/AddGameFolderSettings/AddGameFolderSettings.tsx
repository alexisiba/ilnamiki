import { usePlatforms } from '@renderer/core/ipc'
import { useGoBack } from '@renderer/core/navigation'

import { GameFolderForm } from './components/GameFolderForm'

/**
 * The form that adds a game folder, shown in the Settings content panel in place of the game
 * folders list. Filled with a keyboard and mouse. Its platforms are the installed ones.
 */
export function AddGameFolderSettings(): React.JSX.Element {
  const { platforms } = usePlatforms()
  // Cancel returns to the game folders list, as the back action does.
  const returnToList = useGoBack()

  return <GameFolderForm platforms={platforms} onCancel={returnToList} />
}
