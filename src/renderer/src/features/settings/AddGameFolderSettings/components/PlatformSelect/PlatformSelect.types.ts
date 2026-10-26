import type { InstalledPlatform } from '@renderer/types/installedPlatform'

export interface PlatformSelectProps {
  /** Id of the field's label, which names the select. */
  labelId: string
  /** Id of the select's button, which the label points to. */
  controlId: string
  /** Id of a note that describes the select, e.g. why some platforms aren't listed. */
  descriptionId?: string
  platforms: InstalledPlatform[]
  /** Id of the selected platform; `undefined` while none is. */
  value: string | undefined
  onChange: (platformId: string) => void
}

export interface PlatformSelectDialogProps {
  platforms: InstalledPlatform[]
  value: string | undefined
  onSelect: (platformId: string) => void
  /** Closes the list without choosing. */
  onClose: () => void
}

export interface PlatformSelectOptionProps {
  platform: InstalledPlatform
  selected: boolean
  /** Takes focus when the list opens. */
  autoFocus: boolean
  onSelect: () => void
}
