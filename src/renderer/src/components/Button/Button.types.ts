import type { ComponentPropsWithoutRef } from 'react'

export interface ButtonProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'className' | 'style' | 'type' | 'onClick'
> {
  /** Whether this button holds focus. Moves DOM focus to it. */
  focused?: boolean
  onPress?: () => void
}
