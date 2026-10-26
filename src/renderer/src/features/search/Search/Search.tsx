import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InputScope, useDefaultActions } from '@renderer/core/input'

import { SearchDialog } from './components/SearchDialog'

/** Opens search on its action, the tertiary action's default on screens that keep it. */
export function Search(): React.JSX.Element | null {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  useDefaultActions({
    tertiary: { label: t('buttonGuide.search'), onPress: () => setOpen(true) }
  })

  if (!open) return null

  // Its own input scope: while open, the screen behind gets no input.
  return (
    <InputScope>
      <SearchDialog onClose={() => setOpen(false)} />
    </InputScope>
  )
}
