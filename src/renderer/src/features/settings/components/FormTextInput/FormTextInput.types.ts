import type { ComponentPropsWithoutRef } from 'react'

export interface FormTextInputProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'className' | 'style' | 'type' | 'onChange'
> {
  /** Unique within the form; lets focus be remembered and restored. */
  focusId: string
  autoFocus?: boolean
  onChange: (value: string) => void
}
