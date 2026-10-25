import type { RouteObject } from 'react-router'

import {
  ADD_EMULATOR_PATH,
  CONSOLE_GAMES_PATH,
  GAME_DETAILS_PATH,
  SECTION_PATHS
} from '@renderer/core/navigation'
import { ConsoleSelectScreen } from '@renderer/features/consoles'
import { ConsoleGamesScreen, GameDetailsScreen } from '@renderer/features/games'
import { HomeScreen } from '@renderer/features/home'
import { AddEmulatorSettings, SettingsScreen } from '@renderer/features/settings'
import App from './App'

/** App layout with one child route per top-level section, plus the screens inside them. */
export const APP_ROUTES: RouteObject[] = [
  {
    path: SECTION_PATHS.home,
    element: <App />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: SECTION_PATHS.library, element: <ConsoleSelectScreen /> },
      { path: CONSOLE_GAMES_PATH, element: <ConsoleGamesScreen /> },
      // Settings keeps its categories on screen and shows its own screens in the content panel.
      {
        path: SECTION_PATHS.settings,
        element: <SettingsScreen />,
        children: [{ path: ADD_EMULATOR_PATH, element: <AddEmulatorSettings /> }]
      },
      { path: GAME_DETAILS_PATH, element: <GameDetailsScreen /> }
    ]
  }
]
