import { useTranslation } from 'react-i18next'

import { ButtonGuide } from '@renderer/components/ButtonGuide'

/**
 * The button guide over the blur, with the dialog's general actions. The keyboard's own
 * shortcuts are shown on their keys instead.
 */
export function SearchGuide(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <ButtonGuide
      hints={[
        { action: 'navigate', label: t('buttonGuide.navigate') },
        { action: 'confirm', label: t('buttonGuide.select') },
        { action: 'back', label: t('buttonGuide.close') }
      ]}
    />
  )
}
