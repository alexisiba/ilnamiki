/** Which known emulator an application is, or `unknown` when Ilnamiki doesn't recognize it. */
export type EmulatorKind = 'retroarch' | 'unknown'

/** An emulator the user added. */
export interface Emulator {
  id: string
  kind: EmulatorKind
  /** Name shown in the app: detected from the application, then editable by the user. */
  name: string
  /** Absolute path to the emulator's application. */
  executablePath: string
  /** Version as the application reports it (e.g. "1.22.2"), or null when it doesn't say. */
  version: string | null
  /** The emulator's own icon as a `data:` URL, or null when it has none. */
  iconDataUrl: string | null
  /** When it was added, in milliseconds since the epoch. */
  addedAt: number
}

/** What could be detected about an application before adding it. */
export interface EmulatorInspection {
  kind: EmulatorKind
  /** Name the application declares, or null when it declares none. */
  name: string | null
  version: string | null
  iconDataUrl: string | null
}

/** Why an application can't be an emulator. */
export type EmulatorProblem =
  /** Nothing exists at the path. */
  | 'not-found'
  /** The path is a folder, not a file. */
  | 'not-a-file'
  /** The file isn't allowed to run. */
  | 'not-executable'
  /** The file isn't in a format Ilnamiki supports yet (only AppImages for now). */
  | 'unsupported-format'

export type InspectEmulatorResult =
  { ok: true; inspection: EmulatorInspection } | { ok: false; problem: EmulatorProblem }

export interface AddEmulatorRequest {
  /** Absolute path to the emulator's application. */
  executablePath: string
  /** Name to show; not empty. */
  name: string
}

export type AddEmulatorResult =
  | { ok: true; emulator: Emulator }
  /** `already-added` when an emulator with the same application exists. */
  | { ok: false; problem: EmulatorProblem | 'already-added' }

export interface ChangeEmulatorPathRequest {
  /** The emulator whose application moved. */
  id: string
  /** Absolute path to its application now. */
  executablePath: string
}

export type ChangeEmulatorPathResult =
  | { ok: true; emulator: Emulator }
  /** `unknown-emulator` when no emulator has that id (e.g. it was removed). */
  | { ok: false; problem: EmulatorProblem | 'already-added' | 'unknown-emulator' }

/** Setting up the emulators Ilnamiki launches games with. */
export interface EmulatorsApi {
  /**
   * Asks the user to choose an emulator's application file with the system's file picker.
   * Resolves with the file's absolute path, or null when the user cancels.
   */
  pickExecutable(): Promise<string | null>
  /** What can be detected about the application at `executablePath`, or why it can't be used. */
  inspect(executablePath: string): Promise<InspectEmulatorResult>
  /** Adds an emulator, detecting what it can about its application, or says why it can't. */
  add(request: AddEmulatorRequest): Promise<AddEmulatorResult>
  /** The emulators the user added, oldest first. */
  list(): Promise<Emulator[]>
  /**
   * Points an emulator at another application, detecting it again (its name stays), or says
   * why it can't; on a problem the emulator is left as it was.
   */
  changePath(request: ChangeEmulatorPathRequest): Promise<ChangeEmulatorPathResult>
  /** Removes an emulator from Ilnamiki; its application stays on the computer. */
  remove(id: string): Promise<void>
}

export const EMULATORS_CHANNELS = {
  pickExecutable: 'emulators:pick-executable',
  inspect: 'emulators:inspect',
  add: 'emulators:add',
  list: 'emulators:list',
  changePath: 'emulators:change-path',
  remove: 'emulators:remove'
} as const
