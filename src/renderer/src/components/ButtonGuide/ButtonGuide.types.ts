import type { ButtonHintProps } from '@renderer/components/ButtonHint'

export interface ButtonGuideProps {
  /** Hints to show instead of the current screen's, e.g. for a dialog over it. */
  hints?: ButtonHintProps[]
}
