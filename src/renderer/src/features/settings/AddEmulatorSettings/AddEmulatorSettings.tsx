import { useGoBack } from '@renderer/core/navigation'

import { EmulatorForm } from './components/EmulatorForm'

/**
 * The form that adds an emulator, a screen inside Settings opened from the emulators list,
 * which it returns to when leaving or once the emulator is added. Filled with a keyboard and
 * mouse.
 */
export function AddEmulatorSettings(): React.JSX.Element {
  // As the back action does.
  const returnToList = useGoBack()

  return <EmulatorForm onBack={returnToList} onAdded={returnToList} />
}
