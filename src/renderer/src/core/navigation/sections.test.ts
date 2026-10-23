import { describe, expect, it } from 'vitest'

import { getConsoleGamesPath, getGameDetailsPath, getSectionPath, isSectionRoot } from './sections'

describe('getSectionPath', () => {
  it.each([
    ['/', '/'],
    ['/library', '/library'],
    ['/settings', '/settings'],
    ['/settings/display', '/settings']
  ])('places %s in the %s section', (pathname, section) => {
    expect(getSectionPath(pathname)).toBe(section)
  })

  it('places a game’s details in Home', () => {
    expect(getSectionPath(getGameDetailsPath('mgs-ps1'))).toBe('/')
  })

  it('places a console’s games in Library', () => {
    expect(getSectionPath(getConsoleGamesPath('ps1'))).toBe('/library')
  })

  it('does not mistake a path that only starts like a section for it', () => {
    expect(getSectionPath('/libraryish')).toBe('/')
  })
})

describe('isSectionRoot', () => {
  it('is true only for section roots', () => {
    expect(isSectionRoot('/library')).toBe(true)
    expect(isSectionRoot(getGameDetailsPath('mgs-ps1'))).toBe(false)
    expect(isSectionRoot(getConsoleGamesPath('ps1'))).toBe(false)
  })
})

describe('getConsoleGamesPath', () => {
  it('builds the games path of a console inside the library', () => {
    expect(getConsoleGamesPath('ps1')).toBe('/library/ps1')
  })
})

describe('getGameDetailsPath', () => {
  it('builds the details path of a game', () => {
    expect(getGameDetailsPath('mgs-ps1')).toBe('/games/mgs-ps1')
  })

  it('encodes ids that are not URL-safe', () => {
    expect(getGameDetailsPath('a b/c')).toBe('/games/a%20b%2Fc')
  })
})
