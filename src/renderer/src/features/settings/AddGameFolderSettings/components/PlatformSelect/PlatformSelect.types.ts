import type { AssociatedPlatform } from '@renderer/types/associatedPlatform'

export interface PlatformSelectProps {
  /** Id of the field's label, which names the select. */
  labelId: string
  /** Id of the select's button, which the label points to. */
  controlId: string
  platforms: AssociatedPlatform[]
  /** Id of the selected platform; `undefined` while none is. */
  value: string | undefined
  onChange: (platformId: string) => void
}

export interface PlatformSelectDialogProps {
  /** Id of the field's label, which names the list. */
  labelId: string
  platforms: AssociatedPlatform[]
  value: string | undefined
  onSelect: (platformId: string) => void
  /** Closes the list without choosing. */
  onClose: () => void
}

export interface PlatformSelectOptionProps {
  platform: AssociatedPlatform
  selected: boolean
  /** Takes focus when the list opens. */
  autoFocus: boolean
  onSelect: () => void
}
