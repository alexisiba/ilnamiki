import { describe, expect, it } from 'vitest'

import { selectForPlatform, toPlatform } from './platform'

describe('toPlatform', () => {
  it('maps the supported Node.js platforms', () => {
    expect(toPlatform('linux')).toBe('linux')
    expect(toPlatform('win32')).toBe('windows')
    expect(toPlatform('darwin')).toBe('macos')
  })

  it('returns null for platforms Ilnamiki does not support', () => {
    expect(toPlatform('freebsd')).toBeNull()
  })
})

describe('selectForPlatform', () => {
  const implementations = { linux: 'linux provider' }

  it('picks the implementation for the platform', () => {
    expect(selectForPlatform(implementations, 'fallback', 'linux')).toBe('linux provider')
  })

  it('falls back when the platform has no implementation', () => {
    expect(selectForPlatform(implementations, 'fallback', 'windows')).toBe('fallback')
  })

  it('falls back when the platform is not supported', () => {
    expect(selectForPlatform(implementations, 'fallback', null)).toBe('fallback')
  })
})
