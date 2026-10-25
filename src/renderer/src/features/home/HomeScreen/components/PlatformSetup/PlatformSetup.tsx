import { Joystick } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useOpenSettings } from '@renderer/core/navigation'

import { SetupPanel } from '../SetupPanel'

/**
 * Shown on Home while the user's emulators play no platform yet (e.g. RetroArch without
 * cores): that the emulator needs setting up for the consoles to play, and the action,
 * focused, that opens the emulators in Settings.
 */
export function PlatformSetup(): React.JSX.Element {
  const { t } = useTranslation('home')
  const openSettings = useOpenSettings()

  return (
    <SetupPanel
      id="platform-setup"
      icon={Joystick}
      title={t('platformSetup.title')}
      description={t('platformSetup.description')}
      actionLabel={t('platformSetup.setUp')}
      onAction={() => openSettings('emulators')}
    />
  )
}
