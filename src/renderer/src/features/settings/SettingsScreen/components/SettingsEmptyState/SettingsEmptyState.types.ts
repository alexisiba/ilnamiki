import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface SettingsEmptyStateProps {
  /** Decorative icon above the title. */
  icon: LucideIcon
  /** Says what is missing, e.g. "No emulators configured". */
  title: string
  /** Says how to get it. */
  description: string
  /** What the user can do about it, e.g. a button that takes them there. */
  action?: ReactNode
}
