import { describe, expect, it } from 'vitest'

import { parsePlatformId } from './platforms.validation'

describe('parsePlatformId', () => {
  it('accepts a platform id', () => {
    expect(parsePlatformId('nintendo_64')).toBe('nintendo_64')
    expect(parsePlatformId('sega-cd')).toBe('sega-cd')
  })

  it('refuses anything that can’t be a platform id', () => {
    expect(parsePlatformId('')).toBeNull()
    expect(parsePlatformId('../etc')).toBeNull()
    expect(parsePlatformId('a'.repeat(101))).toBeNull()
    expect(parsePlatformId(64)).toBeNull()
  })
})
