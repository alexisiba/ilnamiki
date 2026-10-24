import type { ComponentPropsWithoutRef } from 'react'

export interface ButtonProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'className' | 'style' | 'type' | 'onClick'
> {
  /** Unique within its focus group; lets focus be remembered and restored. */
  focusId: string
  onPress?: () => void
}
