import type { ComponentPropsWithoutRef } from 'react'

export interface EmulatorFormProps {
  /** Leaves the form without adding anything. */
  onBack: () => void
}

export interface FormTextInputProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'className' | 'style' | 'type' | 'onChange'
> {
  /** Unique within the form; lets focus be remembered and restored. */
  focusId: string
  autoFocus?: boolean
  onChange: (value: string) => void
}

export interface BrowseButtonProps {
  onPress: () => void
}
