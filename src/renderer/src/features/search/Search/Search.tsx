import { useState } from 'react'

import { InputScope, useInputAction } from '@renderer/core/input'

import { SearchDialog } from './components/SearchDialog'

/** Opens search on its action, from any screen. */
export function Search(): React.JSX.Element | null {
  const [open, setOpen] = useState(false)

  useInputAction((action) => {
    if (action === 'tertiary') setOpen(true)
  })

  if (!open) return null

  // Its own input scope: while open, the screen behind gets no input.
  return (
    <InputScope>
      <SearchDialog onClose={() => setOpen(false)} />
    </InputScope>
  )
}
