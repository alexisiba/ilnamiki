import type { RouteObject } from 'react-router'

import { GAME_DETAILS_PATH, SECTION_PATHS } from '@renderer/core/navigation'
import { GameDetailsScreen, LibraryScreen } from '@renderer/features/games'
import { HomeScreen } from '@renderer/features/home'
import { SettingsScreen } from '@renderer/features/settings'
import App from './App'

/** App layout with one child route per top-level section, plus the screens inside them. */
export const APP_ROUTES: RouteObject[] = [
  {
    path: SECTION_PATHS.home,
    element: <App />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: SECTION_PATHS.library, element: <LibraryScreen /> },
      { path: SECTION_PATHS.settings, element: <SettingsScreen /> },
      { path: GAME_DETAILS_PATH, element: <GameDetailsScreen /> }
    ]
  }
]
