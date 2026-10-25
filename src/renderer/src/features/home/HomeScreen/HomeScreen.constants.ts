/**
 * Sample last played game until play sessions are recorded. `null`, as when nothing was played
 * yet, shows the "Ready to play" hero; a sample id (e.g. `'tloz-oot-n64'`) shows the continue
 * playing hero and the sample shelves.
 */
export const SAMPLE_LAST_PLAYED_GAME_ID: string | null = null

/** Sample "Play again" shelf until the library exists, most recent first. */
export const SAMPLE_RECENT_GAME_IDS = [
  'dk-64',
  'smb3-nes',
  'mgs-ps1',
  'spyro-ps1',
  'thps-u2-ps2',
  'mh-fu-psp'
]

/** Sample "Recently added" shelf until the library exists. */
export const SAMPLE_RECENTLY_ADDED_GAME_IDS = [
  'spyro-ps1',
  'tloz-oot-n64',
  'mh-fu-psp',
  'thps-u2-ps2',
  'smb3-nes',
  'mgs-ps1'
]
