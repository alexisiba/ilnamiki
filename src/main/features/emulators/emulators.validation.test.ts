import { describe, expect, it } from 'vitest'

import {
  EMULATOR_NAME_MAX_LENGTH,
  parseAddEmulatorRequest,
  parseChangeEmulatorPathRequest,
  parseEmulatorId,
  parseExecutablePath
} from './emulators.validation'

const PATH = '/home/player/Emulators/RetroArch-Linux-x86_64.AppImage'
const ID = '33b85b34-3541-4897-bd70-49ed7143fcfd'

describe('parseEmulatorId', () => {
  it('accepts a UUID', () => {
    expect(parseEmulatorId(ID)).toBe(ID)
  })

  it('refuses anything else', () => {
    expect(parseEmulatorId('retroarch')).toBeNull()
    expect(parseEmulatorId(`${ID}' OR 1=1`)).toBeNull()
    expect(parseEmulatorId(42)).toBeNull()
  })
})

describe('parseChangeEmulatorPathRequest', () => {
  it('accepts an id and an absolute path', () => {
    expect(parseChangeEmulatorPathRequest({ id: ID, executablePath: PATH })).toEqual({
      id: ID,
      executablePath: PATH
    })
  })

  it('refuses requests without a valid id or path', () => {
    expect(parseChangeEmulatorPathRequest({ id: 'x', executablePath: PATH })).toBeNull()
    expect(parseChangeEmulatorPathRequest({ id: ID, executablePath: 'relative' })).toBeNull()
    expect(parseChangeEmulatorPathRequest(null)).toBeNull()
  })
})

describe('parseExecutablePath', () => {
  it('accepts an absolute path', () => {
    expect(parseExecutablePath(PATH)).toBe(PATH)
  })

  it('refuses relative paths and anything that is not a string', () => {
    expect(parseExecutablePath('RetroArch.AppImage')).toBeNull()
    expect(parseExecutablePath('')).toBeNull()
    expect(parseExecutablePath(42)).toBeNull()
    expect(parseExecutablePath(undefined)).toBeNull()
  })
})

describe('parseAddEmulatorRequest', () => {
  it('accepts a path and a name, trimming the name', () => {
    expect(parseAddEmulatorRequest({ executablePath: PATH, name: '  RetroArch ' })).toEqual({
      executablePath: PATH,
      name: 'RetroArch'
    })
  })

  it('refuses an empty or too long name', () => {
    expect(parseAddEmulatorRequest({ executablePath: PATH, name: '   ' })).toBeNull()
    expect(
      parseAddEmulatorRequest({
        executablePath: PATH,
        name: 'x'.repeat(EMULATOR_NAME_MAX_LENGTH + 1)
      })
    ).toBeNull()
  })

  it('refuses requests without a valid path or name', () => {
    expect(parseAddEmulatorRequest({ executablePath: 'relative', name: 'RetroArch' })).toBeNull()
    expect(parseAddEmulatorRequest({ executablePath: PATH })).toBeNull()
    expect(parseAddEmulatorRequest(null)).toBeNull()
    expect(parseAddEmulatorRequest('RetroArch')).toBeNull()
  })
})
