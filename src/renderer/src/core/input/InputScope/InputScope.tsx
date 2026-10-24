import { useEffect, useState, type ReactNode } from 'react'

import { InputScopeContext, openScopes } from '../inputScope'

export interface InputScopeProps {
  children: ReactNode
}

/**
 * While mounted, only the input handlers inside it receive actions, e.g. a dialog: the screen
 * behind neither moves focus nor goes back until it closes. The newest open scope wins.
 */
export function InputScope({ children }: InputScopeProps): React.JSX.Element {
  const [scope] = useState(() => Symbol('input scope'))

  useEffect(() => {
    openScopes.push(scope)
    return () => {
      openScopes.splice(openScopes.indexOf(scope), 1)
    }
  }, [scope])

  return <InputScopeContext value={scope}>{children}</InputScopeContext>
}
