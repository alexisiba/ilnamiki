import { useNavigate } from 'react-router'

import { usePlatforms } from '@renderer/core/ipc'
import { SECTION_PATHS } from '@renderer/core/navigation'

import { GameFolderForm } from './components/GameFolderForm'

/**
 * The form that adds a game folder, shown in the Settings content panel in place of the game
 * folders list. Filled with a keyboard and mouse. Its platforms are the installed ones.
 */
export function AddGameFolderSettings(): React.JSX.Element {
  const navigate = useNavigate()
  const { platforms } = usePlatforms()

  return (
    <GameFolderForm
      platforms={platforms}
      // Cancel returns to the game folders list, as the back action does.
      onCancel={() => navigate(SECTION_PATHS.settings, { replace: true })}
    />
  )
}
