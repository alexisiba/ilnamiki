import { useNavigate } from 'react-router'

import { SECTION_PATHS } from '@renderer/core/navigation'

import { EmulatorForm } from './components/EmulatorForm'

/**
 * The form that adds an emulator, shown in the Settings content panel in place of the
 * emulators list. Filled with a keyboard and mouse.
 */
export function AddEmulatorSettings(): React.JSX.Element {
  const navigate = useNavigate()

  // Back returns to the emulators list, as the back action does.
  return <EmulatorForm onBack={() => navigate(SECTION_PATHS.settings, { replace: true })} />
}
