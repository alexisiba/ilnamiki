import { useState } from 'react'

import { useInputAction } from '@renderer/core/input'

import { SearchDialog } from './components/SearchDialog'

/** Opens search on its action, from any screen. */
export function Search(): React.JSX.Element | null {
  const [open, setOpen] = useState(false)

  useInputAction((action) => {
    if (action === 'tertiary') setOpen(true)
  })

  return open ? <SearchDialog onClose={() => setOpen(false)} /> : null
}
