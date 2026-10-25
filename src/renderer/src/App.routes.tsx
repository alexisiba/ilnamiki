import type { RouteObject } from 'react-router'

import {
  ADD_EMULATOR_PATH,
  ADD_GAME_FOLDER_PATH,
  CONSOLE_GAMES_PATH,
  EMULATOR_DETAILS_PATH,
  GAME_DETAILS_PATH,
  SECTION_PATHS
} from '@renderer/core/navigation'
import { ConsoleSelectScreen } from '@renderer/features/consoles'
import { ConsoleGamesScreen, GameDetailsScreen } from '@renderer/features/games'
import { HomeScreen } from '@renderer/features/home'
import {
  AddEmulatorSettings,
  AddGameFolderSettings,
  EmulatorDetailsSettings,
  SettingsScreen
} from '@renderer/features/settings'
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
      // Settings shows its own screens across its whole width, in place of its categories.
      {
        path: SECTION_PATHS.settings,
        element: <SettingsScreen />,
        children: [
          { path: ADD_EMULATOR_PATH, element: <AddEmulatorSettings /> },
          { path: EMULATOR_DETAILS_PATH, element: <EmulatorDetailsSettings /> },
          { path: ADD_GAME_FOLDER_PATH, element: <AddGameFolderSettings /> }
        ]
      },
      { path: GAME_DETAILS_PATH, element: <GameDetailsScreen /> }
    ]
  }
]
