import type { AddEmulatorResult, ChangeEmulatorPathResult } from '@shared/api'

/**
 * Why an emulator's application can't be used, as Settings explains it: what main reports
 * when adding one or changing its path, a path that isn't absolute, or a failure to reach main.
 */
export type EmulatorProblem =
  | Extract<AddEmulatorResult, { ok: false }>['problem']
  | Extract<ChangeEmulatorPathResult, { ok: false }>['problem']
  | 'relative-path'
  | 'failed'

const MESSAGE_KEYS: Record<EmulatorProblem, string> = {
  'not-found': 'emulatorProblems.notFound',
  'not-a-file': 'emulatorProblems.notAFile',
  'not-executable': 'emulatorProblems.notExecutable',
  'unsupported-format': 'emulatorProblems.unsupportedFormat',
  'already-added': 'emulatorProblems.alreadyAdded',
  'unknown-emulator': 'emulatorProblems.unknownEmulator',
  'relative-path': 'emulatorProblems.relativePath',
  failed: 'emulatorProblems.failed'
}

/** The key, in the `settings` namespace, of the message that explains `problem`. */
export function emulatorProblemMessageKey(problem: EmulatorProblem): string {
  return MESSAGE_KEYS[problem]
}
