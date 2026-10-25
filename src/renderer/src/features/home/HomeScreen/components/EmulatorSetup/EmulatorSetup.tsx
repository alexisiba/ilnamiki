import { Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useOpenSettings } from '@renderer/core/navigation'

import { SetupPanel } from '../SetupPanel'

/**
 * Shown on Home while the user has no emulator: that one is needed (RetroArch recommended to
 * start) and the action, focused, that opens the emulators in Settings.
 */
export function EmulatorSetup(): React.JSX.Element {
  const { t } = useTranslation('home')
  const openSettings = useOpenSettings()

  return (
    <SetupPanel
      id="emulator-setup"
      icon={Gamepad2}
      title={t('emulatorSetup.title')}
      description={t('emulatorSetup.description')}
      actionLabel={t('emulatorSetup.setUp')}
      onAction={() => openSettings('emulators')}
    />
  )
}
