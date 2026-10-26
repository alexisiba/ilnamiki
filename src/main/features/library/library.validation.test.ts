import { describe, expect, it } from 'vitest'

import {
  parseFolderId,
  parseFolderPath,
  parseScanFolderRequest,
  parseScanId
} from './library.validation'

describe('parseFolderPath', () => {
  it('accepts an absolute path, written one way only', () => {
    expect(parseFolderPath('/media/player//PS1/')).toBe('/media/player/PS1')
  })

  it('rejects a path that isn’t absolute, is too long or isn’t text', () => {
    expect(parseFolderPath('Games/PS1')).toBeNull()
    expect(parseFolderPath(`/${'a'.repeat(5000)}`)).toBeNull()
    expect(parseFolderPath(42)).toBeNull()
  })
})

describe('parseScanFolderRequest', () => {
  it('accepts an absolute path and a platform id', () => {
    expect(
      parseScanFolderRequest({ path: '/home/player/Games/PS1', platformId: 'playstation' })
    ).toEqual({ path: '/home/player/Games/PS1', platformId: 'playstation' })
  })

  it('writes the path one way only, so a folder can’t be added twice', () => {
    expect(
      parseScanFolderRequest({ path: '/home/player/Games//PS1/', platformId: 'playstation' })
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

describe('parseScanId', () => {
  it('accepts a scan id', () => {
    expect(parseScanId('0b6c7b5e-3f43-4c1e-9d2a-6f0e8a1b2c3d')).toBe(
      '0b6c7b5e-3f43-4c1e-9d2a-6f0e8a1b2c3d'
    )
  })

  it('rejects anything else', () => {
    expect(parseScanId('latest')).toBeNull()
    expect(parseScanId(42)).toBeNull()
  })
})

describe('parseFolderId', () => {
  it('accepts a folder id', () => {
    expect(parseFolderId('0b6c7b5e-3f43-4c1e-9d2a-6f0e8a1b2c3d')).toBe(
      '0b6c7b5e-3f43-4c1e-9d2a-6f0e8a1b2c3d'
    )
  })

  it('rejects anything else', () => {
    expect(parseFolderId("' OR 1=1 --")).toBeNull()
    expect(parseFolderId(null)).toBeNull()
  })
})
