import { useNavigate } from 'react-router'

import { SECTION_PATHS } from '@renderer/core/navigation'

import { EmulatorForm } from './components/EmulatorForm'

/**
 * The form that adds an emulator, shown in the Settings content panel in place of the
 * emulators list, which it returns to when leaving or once the emulator is added. Filled with
 * a keyboard and mouse.
 */
export function AddEmulatorSettings(): React.JSX.Element {
  const navigate = useNavigate()
  // As the back action does.
  const returnToList = (): void => {
    navigate(SECTION_PATHS.settings, { replace: true })
  }

  return <EmulatorForm onBack={returnToList} onAdded={returnToList} />
}
