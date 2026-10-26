import type { ReactNode } from 'react'

export interface FormFieldProps {
  label: string
  /** Id of the control the label names. */
  controlId: string
  /** Id of the label, for controls that name themselves with it (`aria-labelledby`). */
  labelId?: string
  children: ReactNode
}
