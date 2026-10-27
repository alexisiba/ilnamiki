/** The folders an emulator runs with, as the user's own would be for a program they run. */
export interface InstallationFolders {
  /** Its home folder. */
  home: string
  /** Where it keeps its configuration, e.g. "~/.config". */
  config: string
  /** Where it keeps its data, e.g. "~/.local/share". */
  data: string
}

/** What to run to start an emulator. */
export interface InstallationCommand {
  /** Absolute path of the program. */
  file: string
  args: string[]
}

/**
 * How an emulator is installed on this computer: how it is run and where its folders are,
 * whatever emulator it is.
 */
export interface EmulatorInstallation {
  /** The command that runs the emulator with `args`, its own arguments. */
  command(args: string[]): InstallationCommand
  /** The folders it runs with, or null when they can't be known on this system. */
  folders(): Promise<InstallationFolders | null>
}
