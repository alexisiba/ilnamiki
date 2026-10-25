import { useNavigate } from 'react-router'

import { SECTION_PATHS } from '@renderer/core/navigation'
import { SAMPLE_ASSOCIATED_PLATFORMS } from '@renderer/mocks/associatedPlatforms'

import { GameFolderForm } from './components/GameFolderForm'

/**
 * The form that adds a game folder, shown in the Settings content panel in place of the game
 * folders list. Filled with a keyboard and mouse. Sample platforms for now.
 */
export function AddGameFolderSettings(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <GameFolderForm
      platforms={SAMPLE_ASSOCIATED_PLATFORMS}
      // Cancel returns to the game folders list, as the back action does.
      onCancel={() => navigate(SECTION_PATHS.settings, { replace: true })}
    />
  )
}
