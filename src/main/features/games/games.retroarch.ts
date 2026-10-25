/**
 * Values of RetroArch's `input_quit_gamepad_combo`, from its `input_combo_type` enum
 * (input/input_defines.h). Only the one used is listed.
 */
const QUIT_COMBO_START_SELECT = 4

/** `quit_on_close_content` set to quit (QUIT_ON_CLOSE_CONTENT_ENABLED in retroarch_types.h). */
const QUIT_ON_CLOSE_CONTENT_ENABLED = 1

/**
 * The settings Ilnamiki adds to the user's RetroArch configuration while a game is played,
 * as a configuration file's text:
 * - Start + Select together quit RetroArch, so the gamepad alone returns to Ilnamiki
 *   (RetroArch asks to press it again first, unless its user turned that off).
 * - Closing the game from RetroArch's menu quits RetroArch too, instead of staying in it.
 * - RetroArch doesn't save its configuration on quitting, so these settings never end up
 *   in the user's `retroarch.cfg`.
 */
export function retroArchOverridesText(): string {
  return [
    `input_quit_gamepad_combo = "${QUIT_COMBO_START_SELECT}"`,
    `quit_on_close_content = "${QUIT_ON_CLOSE_CONTENT_ENABLED}"`,
    'config_save_on_exit = "false"',
    ''
  ].join('\n')
}

export interface RetroArchLaunch {
  /** Absolute path of the core's library to load. */
  coreLibraryPath: string
  /** Absolute path of the file with `retroArchOverridesText`. */
  overridesPath: string
  /** Absolute path of the game's file. */
  gamePath: string
}

/**
 * The arguments that start RetroArch in full screen straight into the game, with the core
 * and Ilnamiki's settings added to the user's configuration. The game goes last, as is.
 */
export function retroArchLaunchArgs({
  coreLibraryPath,
  overridesPath,
  gamePath
}: RetroArchLaunch): string[] {
  return ['--fullscreen', '-L', coreLibraryPath, '--appendconfig', overridesPath, gamePath]
}
