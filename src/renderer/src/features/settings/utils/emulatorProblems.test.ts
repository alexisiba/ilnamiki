import { describe, expect, it } from 'vitest'

import i18n from '@renderer/core/i18n'

import { emulatorProblemMessageKey, type EmulatorProblem } from './emulatorProblems'

const PROBLEMS: EmulatorProblem[] = [
  'not-found',
  'not-a-file',
  'not-executable',
  'unsupported-format',
  'already-added',
  'unknown-emulator',
  'relative-path',
  'failed'
]

describe('emulatorProblemMessageKey', () => {
  it('has a message for every problem, in every language', () => {
    for (const language of ['en', 'es']) {
      for (const problem of PROBLEMS) {
        const key = emulatorProblemMessageKey(problem)
        expect(i18n.exists(key, { ns: 'settings', lng: language }), `${language}: ${key}`).toBe(
          true
        )
      }
    }
  })

  it('explains the problems in plain words', () => {
    const t = i18n.getFixedT('en', 'settings')

    expect(t(emulatorProblemMessageKey('unsupported-format'))).toBe(
      'Only AppImages are supported for now.'
    )
    expect(t(emulatorProblemMessageKey('unknown-emulator'))).toBe(
      'This emulator is no longer in Ilnamiki.'
    )
  })
})
