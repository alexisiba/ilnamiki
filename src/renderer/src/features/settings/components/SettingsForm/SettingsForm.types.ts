import type { ReactNode } from 'react'

export interface SettingsFormProps {
  /** Unique across the app: the form's focus group. */
  id: string
  /** What the form does, e.g. "Add emulator". */
  title: string
  /** The form's buttons, e.g. Cancel and the one that submits it. */
  actions: ReactNode
  /** The form's fields. */
  children: ReactNode
}

export interface SettingsFormHeaderProps {
  title: string
}
