import { describe, expect, it } from 'vitest'

import { parseScanFolderRequest } from './library.validation'

describe('parseScanFolderRequest', () => {
  it('accepts an absolute path and a platform id', () => {
    expect(
      parseScanFolderRequest({ path: '/home/player/Games/PS1', platformId: 'playstation' })
    ).toEqual({ path: '/home/player/Games/PS1', platformId: 'playstation' })
  })

  it('rejects a path that isn’t absolute or is too long', () => {
    expect(parseScanFolderRequest({ path: 'Games/PS1', platformId: 'playstation' })).toBeNull()
    expect(
      parseScanFolderRequest({ path: `/${'a'.repeat(5000)}`, platformId: 'playstation' })
    ).toBeNull()
  })

  it('rejects a platform id that can’t be one', () => {
    expect(parseScanFolderRequest({ path: '/games', platformId: '' })).toBeNull()
    expect(parseScanFolderRequest({ path: '/games', platformId: '../etc' })).toBeNull()
    expect(parseScanFolderRequest({ path: '/games', platformId: 64 })).toBeNull()
  })

  it('rejects anything that isn’t a request', () => {
    expect(parseScanFolderRequest(null)).toBeNull()
    expect(parseScanFolderRequest('/games')).toBeNull()
  })
})
