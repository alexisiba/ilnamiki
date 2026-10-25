import type { LucideIcon } from 'lucide-react'

export interface SetupPanelProps {
  /** Focus group of the panel, so focus can return to its action. */
  id: string
  /** What is missing, drawn large above the title. */
  icon: LucideIcon
  title: string
  /** Why it is needed and how to get it. */
  description: string
  /** The action that gets what is missing; it is focused when the panel shows. */
  actionLabel: string
  onAction: () => void
}
