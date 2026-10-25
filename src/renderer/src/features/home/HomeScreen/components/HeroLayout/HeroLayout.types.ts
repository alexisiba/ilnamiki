import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface HeroLayoutProps {
  /** Focus group of the hero, so focus can return to its actions. */
  id: string
  /** Decorative artwork on the right, fading into the background. */
  imageUrl: string
  /** Shown above the eyebrow (e.g. the game's platform); optional. */
  badge?: ReactNode
  /** What the hero offers (e.g. "Resume session"), with its icon, above the title. */
  eyebrowIcon: LucideIcon
  /** `filled` (default) for solid shapes such as Play; `outline`, larger, for detailed icons. */
  eyebrowIconStyle?: 'filled' | 'outline'
  eyebrow: string
  title: string
  description: string
  /** Facts below the description (e.g. playtime); information, not controls. */
  details: ReactNode
  /** The hero's buttons; one of them is focused when Home shows. */
  actions: ReactNode
}
