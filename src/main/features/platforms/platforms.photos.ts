/** A photo of a console on Wikimedia Commons, with what crediting it takes. */
export interface PlatformPhoto {
  /** Name of the file on Commons, without the "File:" prefix. */
  commonsFile: string
  author: string
  /** As Commons names it, e.g. "Public domain" or "CC BY-SA 3.0". */
  license: string
}

/**
 * The photo of each platform's console, by platform id. All are PNGs by Evan Amos, taken from
 * the same angle on a transparent background, home consoles with their controller, so they
 * look alike side by side. A platform id groups related consoles (e.g. `game_boy` also plays
 * Game Boy Color), so its photo is of the console it is named after. Platforms without a photo
 * by him are left out.
 */
export const PLATFORM_PHOTOS: Record<string, PlatformPhoto> = {
  '3do': { commonsFile: '3DO-FZ1-Console-Set.png', author: 'Evan-Amos', license: 'CC BY-SA 3.0' },
  '3ds': {
    commonsFile: 'Nintendo-3DS-AquaOpen.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  arcadia: {
    commonsFile: 'Emerson-Arcadia-2001.png',
    author: 'Evan-Amos',
    license: 'CC BY-SA 3.0'
  },
  atari_2600: {
    commonsFile: 'Atari-2600-Wood-4Sw-Set.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  atari_5200: {
    commonsFile: 'Atari-5200-Console-Set.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  atari_7800: {
    commonsFile: 'Atari-7800-Console-Set.png',
    author: 'Evan-Amos',
    license: 'CC BY-SA 3.0'
  },
  atari_jaguar: {
    commonsFile: 'Atari-Jaguar-Console-Set.png',
    author: 'Evan-Amos',
    license: 'CC BY-SA 3.0'
  },
  atari_lynx: {
    commonsFile: 'Atari-Lynx-I-Handheld.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  cdi: { commonsFile: 'CD-i-910-Console-Set.png', author: 'Evan-Amos', license: 'CC BY-SA 3.0' },
  channel_f: {
    commonsFile: 'Fairchild-Channel-F.png',
    author: 'Evan-Amos',
    license: 'CC BY-SA 3.0'
  },
  dreamcast: {
    commonsFile: 'Dreamcast-Console-Set.png',
    author: 'Evan-Amos',
    license: 'CC BY-SA 3.0'
  },
  epochcv: {
    commonsFile: 'Epoch-Cassette-Vision-Console.png',
    author: 'Evan-Amos',
    license: 'CC BY-SA 3.0'
  },
  game_boy: { commonsFile: 'Game-Boy-Original.png', author: 'Evan-Amos', license: 'Public domain' },
  game_boy_advance: {
    commonsFile: 'Nintendo-Game-Boy-Advance-Purple-FL.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  gamecube: {
    commonsFile: 'GameCube-Console-Set.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  intellivision: {
    commonsFile: 'Intellivision-Console-Set.png',
    author: 'Evan-Amos',
    license: 'CC BY-SA 3.0'
  },
  master_system: {
    commonsFile: 'Sega-Master-System-Set.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  mega_drive: {
    commonsFile: 'Sega-Genesis-Mod1-Set.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  nds: { commonsFile: 'Nintendo-DS-Fat-Blue.png', author: 'Evan-Amos', license: 'Public domain' },
  neo_geo_cd: {
    commonsFile: 'Neo-Geo-CD-TopLoader-wController-FL.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  neo_geo_pocket: {
    commonsFile: 'Neo-Geo-Pocket-Color-Blue-Left.png',
    author: 'Evan-Amos',
    license: 'CC0'
  },
  neogeo: {
    commonsFile: 'Neo-Geo-AES-Console-Set.png',
    author: 'Evan-Amos',
    license: 'CC BY-SA 3.0'
  },
  nes: { commonsFile: 'NES-Console-Set.png', author: 'Evan-Amos', license: 'Public domain' },
  nintendo_64: {
    commonsFile: 'N64-Console-Set.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  odyssey2: {
    commonsFile: 'Magnavox-Odyssey-2-Console-Set.png',
    author: 'Evan-Amos',
    license: 'CC BY-SA 3.0'
  },
  pc_engine: {
    commonsFile: 'PC-Engine-Console-Set.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  pc_fx: { commonsFile: 'PC-FX-Console-Set.png', author: 'Evan-Amos', license: 'Public domain' },
  playstation: {
    commonsFile: 'PSX-Console-wController.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  playstation2: {
    commonsFile: 'PS2-Fat-Console-Set.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  playstation3: {
    commonsFile: 'Ps3-fat-console.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  playstation_portable: {
    commonsFile: 'Sony-PSP-1000-Body.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  playstation_vita: {
    commonsFile: 'PlayStation-Vita-1101-FL.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  sega_saturn: {
    commonsFile: 'Sega-Saturn-Console-Set-Mk1.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  super_nes: {
    commonsFile: 'SNES-Mod1-Console-Set.png',
    author: 'Evan-Amos',
    license: 'CC BY-SA 3.0'
  },
  vectrex: { commonsFile: 'Vectrex-Console-Set.png', author: 'Evan-Amos', license: 'CC BY-SA 3.0' },
  virtual_boy: {
    commonsFile: 'Virtual-Boy-Set.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  },
  wonderswan: { commonsFile: 'WonderSwan-Black-Left.png', author: 'Evan-Amos', license: 'CC0' },
  xbox: { commonsFile: 'Xbox-Console-Set.png', author: 'Evan-Amos', license: 'Public domain' },
  xbox_360: {
    commonsFile: 'Xbox-360-Elite-Console-Set.png',
    author: 'Evan-Amos',
    license: 'Public domain'
  }
}
