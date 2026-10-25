import { useState } from 'react'

import { addEmulator, inspectEmulator } from '@renderer/core/ipc'

import type { EmulatorProblem } from '../../../utils/emulatorProblems'
import { isAbsolutePath } from '../../../utils/paths'

export interface EmulatorFormState {
  path: string
  name: string
  problem: EmulatorProblem | undefined
  /** Whether both fields are filled in and nothing is being added. */
  canAdd: boolean
  changePath: (path: string) => void
  changeName: (name: string) => void
  /** Reads what it can about the application chosen in the picker. */
  inspectPicked: (path: string) => Promise<void>
  add: () => Promise<void>
}

/**
 * The emulator form's state. A picked application is inspected right away: its name fills
 * the name field unless the user typed one, and a problem with it shows at once. Adding checks
 * the path again in main and calls `onAdded` once the emulator is saved.
 */
export function useEmulatorForm(onAdded: () => void): EmulatorFormState {
  const [path, setPath] = useState('')
  const [name, setName] = useState('')
  const [nameTyped, setNameTyped] = useState(false)
  const [problem, setProblem] = useState<EmulatorProblem>()
  const [adding, setAdding] = useState(false)

  const changePath = (nextPath: string): void => {
    setPath(nextPath)
    setProblem(undefined)
  }

  const changeName = (nextName: string): void => {
    setName(nextName)
    setNameTyped(nextName !== '')
  }

  const inspectPicked = async (pickedPath: string): Promise<void> => {
    try {
      const result = await inspectEmulator(pickedPath)
      if (!result.ok) {
        setProblem(result.problem)
        return
      }
      const detectedName = result.inspection.name
      if (detectedName && !nameTyped) setName(detectedName)
    } catch {
      // Nothing detected: the user can still type the name.
    }
  }

  const add = async (): Promise<void> => {
    const executablePath = path.trim()
    if (!isAbsolutePath(executablePath)) {
      setProblem('relative-path')
      return
    }

    setAdding(true)
    try {
      const result = await addEmulator({ executablePath, name: name.trim() })
      if (result.ok) {
        onAdded()
        return
      }
      setProblem(result.problem)
    } catch {
      setProblem('failed')
    }
    setAdding(false)
  }

  return {
    path,
    name,
    problem,
    canAdd: path.trim() !== '' && name.trim() !== '' && !adding,
    changePath,
    changeName,
    inspectPicked,
    add
  }
}
